/**
 * ClawXKairos - 自驱动 Agent 系统
 * 
 * 基于时间刻度 (Tick) 的自主任务规划和执行系统
 * 灵感来自 EdgeClaw ClawXKairos
 */

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type TaskPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Task {
  /** 任务 ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 任务描述 */
  description: string;
  /** 任务状态 */
  status: TaskStatus;
  /** 优先级 */
  priority: TaskPriority;
  /** 创建时间 */
  createdAt: number;
  /** 计划执行时间 */
  scheduledAt?: number;
  /** 开始执行时间 */
  startedAt?: number;
  /** 完成时间 */
  completedAt?: number;
  /** 任务结果 */
  result?: any;
  /** 错误信息 */
  error?: string;
  /** 元数据 */
  metadata?: Record<string, any>;
}

export interface TickContext {
  /** 当前 Tick 编号 */
  tick: number;
  /** Tick 开始时间 */
  startTime: number;
  /** 可用任务列表 */
  pendingTasks: Task[];
  /** 系统状态 */
  systemState: Record<string, any>;
}

export interface AgentConfig {
  /** Agent 名称 */
  name: string;
  /** Tick 间隔 (毫秒) */
  tickInterval: number;
  /** 最大并发任务数 */
  maxConcurrentTasks: number;
  /** 自动规划任务 */
  autoPlan: boolean;
  /** 任务超时 (毫秒) */
  taskTimeout: number;
}

/**
 * 任务执行器
 */
export type TaskExecutor = (task: Task, context: TickContext) => Promise<any>;

/**
 * ClawXKairos 自驱动 Agent
 */
export class ClawXKairos {
  private config: AgentConfig;
  private tasks: Map<string, Task>;
  private executors: Map<string, TaskExecutor>;
  private currentTick: number = 0;
  private running: boolean = false;
  private tickTimer?: NodeJS.Timeout;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
    this.tasks = new Map();
    this.executors = new Map();
    
    console.log(`[ClawXKairos] Agent "${config.name}" initialized`);
    console.log(`[ClawXKairos] Tick interval: ${config.tickInterval}ms`);
  }

  /**
   * 注册任务执行器
   */
  registerExecutor(taskType: string, executor: TaskExecutor): void {
    this.executors.set(taskType, executor);
    console.log(`[ClawXKairos] Registered executor for: ${taskType}`);
  }

  /**
   * 创建任务
   */
  createTask(task: Omit<Task, 'id' | 'status' | 'createdAt'>): Task {
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newTask: Task = {
      ...task,
      id,
      status: 'pending',
      createdAt: Date.now(),
    };
    
    this.tasks.set(id, newTask);
    this.emit('task:created', newTask);
    
    console.log(`[ClawXKairos] Task created: ${id} - ${task.name}`);
    return newTask;
  }

  /**
   * 更新任务状态
   */
  updateTaskStatus(taskId: string, status: TaskStatus, result?: any, error?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.warn(`[ClawXKairos] Task not found: ${taskId}`);
      return;
    }

    task.status = status;
    
    if (status === 'running') {
      task.startedAt = Date.now();
    } else if (status === 'completed') {
      task.completedAt = Date.now();
      task.result = result;
    } else if (status === 'failed') {
      task.completedAt = Date.now();
      task.error = error;
    }

    this.emit(`task:${status}`, task);
    this.emit('task:updated', task);
  }

  /**
   * 获取待执行任务
   */
  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        // 按优先级排序
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  /**
   * 执行 Tick
   */
  async executeTick(): Promise<void> {
    this.currentTick++;
    const startTime = Date.now();
    
    console.log(`[ClawXKairos] === Tick ${this.currentTick} ===`);
    
    const context: TickContext = {
      tick: this.currentTick,
      startTime,
      pendingTasks: this.getPendingTasks(),
      systemState: this.getSystemState(),
    };

    this.emit('tick:start', context);

    // 执行待处理任务
    const pendingTasks = context.pendingTasks.slice(0, this.config.maxConcurrentTasks);
    
    if (pendingTasks.length > 0) {
      console.log(`[ClawXKairos] Executing ${pendingTasks.length} tasks...`);
      
      await Promise.all(
        pendingTasks.map(task => this.executeTask(task, context))
      );
    } else {
      console.log('[ClawXKairos] No pending tasks');
    }

    // 清理已完成任务 (保留最近 100 个)
    this.cleanupTasks();

    const duration = Date.now() - startTime;
    console.log(`[ClawXKairos] Tick ${this.currentTick} completed in ${duration}ms`);
    
    this.emit('tick:end', { ...context, duration });
  }

  /**
   * 执行单个任务
   */
  private async executeTask(task: Task, context: TickContext): Promise<void> {
    const executor = this.executors.get(task.name.split(':')[0]);
    
    if (!executor) {
      console.warn(`[ClawXKairos] No executor for task: ${task.name}`);
      this.updateTaskStatus(task.id, 'failed', undefined, 'No executor found');
      return;
    }

    try {
      this.updateTaskStatus(task.id, 'running');
      
      // 设置超时
      const timeout = this.config.taskTimeout;
      const result = await Promise.race([
        executor(task, context),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Task timeout')), timeout)
        ),
      ]);

      this.updateTaskStatus(task.id, 'completed', result);
      console.log(`[ClawXKairos] Task completed: ${task.id}`);
    } catch (error: any) {
      this.updateTaskStatus(task.id, 'failed', undefined, error.message);
      console.error(`[ClawXKairos] Task failed: ${task.id} - ${error.message}`);
    }
  }

  /**
   * 获取系统状态
   */
  private getSystemState(): Record<string, any> {
    return {
      tick: this.currentTick,
      totalTasks: this.tasks.size,
      pendingTasks: this.getPendingTasks().length,
      running: this.running,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  /**
   * 清理任务
   */
  private cleanupTasks(): void {
    const completedTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'completed' || task.status === 'cancelled')
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    // 保留最近 100 个已完成任务
    if (completedTasks.length > 100) {
      for (const task of completedTasks.slice(100)) {
        this.tasks.delete(task.id);
      }
      console.log(`[ClawXKairos] Cleaned up ${completedTasks.length - 100} old tasks`);
    }
  }

  /**
   * 启动 Agent
   */
  start(): void {
    if (this.running) {
      console.warn('[ClawXKairos] Already running');
      return;
    }

    this.running = true;
    console.log('[ClawXKairos] Starting agent...');

    // 立即执行一次
    this.executeTick();

    // 设置定时 Tick
    this.tickTimer = setInterval(
      () => this.executeTick(),
      this.config.tickInterval
    );

    this.emit('agent:start', { tick: this.currentTick });
  }

  /**
   * 停止 Agent
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = undefined;
    }

    console.log('[ClawXKairos] Agent stopped');
    this.emit('agent:stop', { tick: this.currentTick });
  }

  /**
   * 获取任务列表
   */
  getTasks(status?: TaskStatus): Task[] {
    const allTasks = Array.from(this.tasks.values());
    if (status) {
      return allTasks.filter(task => task.status === status);
    }
    return allTasks;
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'pending') {
      return false;
    }

    task.status = 'cancelled';
    task.completedAt = Date.now();
    this.emit('task:cancelled', task);
    
    console.log(`[ClawXKairos] Task cancelled: ${taskId}`);
    return true;
  }

  /**
   * 事件监听
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * 移除事件监听
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * 获取 Agent 状态
   */
  getStatus() {
    return {
      name: this.config.name,
      running: this.running,
      tick: this.currentTick,
      tickInterval: this.config.tickInterval,
      totalTasks: this.tasks.size,
      pendingTasks: this.getPendingTasks().length,
      executors: Array.from(this.executors.keys()),
    };
  }
}

/**
 * 创建 ClawXKairos Agent
 */
export function createClawXKairos(config: AgentConfig): ClawXKairos {
  return new ClawXKairos(config);
}

export default createClawXKairos;
