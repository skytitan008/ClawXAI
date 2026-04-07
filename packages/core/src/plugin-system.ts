/**
 * 插件系统 v3.1.0
 * 
 * 插件 API/市场/热加载/权限管理
 */

export interface Plugin {
  /** 插件 ID */
  id: string;
  /** 插件名称 */
  name: string;
  /** 插件描述 */
  description: string;
  /** 作者 */
  author: string;
  /** 版本 */
  version: string;
  /** 入口文件 */
  entry: string;
  /** 依赖 */
  dependencies: string[];
  /** 权限 */
  permissions: string[];
  /** 配置模式 */
  configSchema?: Record<string, any>;
  /** 是否启用 */
  enabled: boolean;
  /** 安装时间 */
  installedAt: number;
}

export interface PluginContext {
  /** 配置 */
  config: Record<string, any>;
  /** 日志 */
  log: (message: string) => void;
  /** 发送消息 */
  sendMessage: (channel: string, message: any) => void;
  /** 注册命令 */
  registerCommand: (name: string, handler: Function) => void;
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private instances: Map<string, any> = new Map();
  private commands: Map<string, Function> = new Map();

  /**
   * 安装插件
   */
  async install(plugin: Plugin): Promise<void> {
    console.log(`[PluginManager] Installing plugin: ${plugin.name} v${plugin.version}`);
    
    // 验证插件
    if (!this.validatePlugin(plugin)) {
      throw new Error('Invalid plugin');
    }

    // 检查依赖
    await this.checkDependencies(plugin);

    // 保存插件
    this.plugins.set(plugin.id, plugin);
    plugin.installedAt = Date.now();

    console.log(`[PluginManager] Plugin installed: ${plugin.id}`);
  }

  /**
   * 卸载插件
   */
  async uninstall(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    console.log(`[PluginManager] Uninstalling plugin: ${plugin.name}`);

    // 停止插件
    await this.stopPlugin(pluginId);

    // 删除插件
    this.plugins.delete(pluginId);
    this.instances.delete(pluginId);

    console.log(`[PluginManager] Plugin uninstalled: ${pluginId}`);
  }

  /**
   * 启用插件
   */
  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    console.log(`[PluginManager] Enabling plugin: ${plugin.name}`);

    plugin.enabled = true;
    await this.startPlugin(plugin);

    console.log(`[PluginManager] Plugin enabled: ${pluginId}`);
  }

  /**
   * 禁用插件
   */
  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    console.log(`[PluginManager] Disabling plugin: ${plugin.name}`);

    plugin.enabled = false;
    await this.stopPlugin(pluginId);

    console.log(`[PluginManager] Plugin disabled: ${pluginId}`);
  }

  /**
   * 启动插件
   */
  private async startPlugin(plugin: Plugin): Promise<void> {
    console.log(`[PluginManager] Starting plugin: ${plugin.name}`);

    // 创建插件上下文
    const context: PluginContext = {
      config: {},
      log: (msg) => console.log(`[${plugin.name}] ${msg}`),
      sendMessage: (channel, message) => {
        console.log(`[${plugin.name}] Send to ${channel}:`, message);
      },
      registerCommand: (name, handler) => {
        this.commands.set(`${plugin.id}:${name}`, handler);
      },
    };

    // 加载插件 (实际实现需要动态 import)
    // const module = await import(plugin.entry);
    // const instance = module.default(context);
    // this.instances.set(plugin.id, instance);

    console.log(`[PluginManager] Plugin started: ${plugin.id}`);
  }

  /**
   * 停止插件
   */
  private async stopPlugin(pluginId: string): Promise<void> {
    console.log(`[PluginManager] Stopping plugin: ${pluginId}`);

    const instance = this.instances.get(pluginId);
    if (instance && typeof instance.stop === 'function') {
      await instance.stop();
    }

    this.instances.delete(pluginId);

    // 删除插件命令
    for (const [key] of this.commands.entries()) {
      if (key.startsWith(`${pluginId}:`)) {
        this.commands.delete(key);
      }
    }

    console.log(`[PluginManager] Plugin stopped: ${pluginId}`);
  }

  /**
   * 验证插件
   */
  private validatePlugin(plugin: Plugin): boolean {
    return !!(
      plugin.id &&
      plugin.name &&
      plugin.version &&
      plugin.entry
    );
  }

  /**
   * 检查依赖
   */
  private async checkDependencies(plugin: Plugin): Promise<void> {
    for (const dep of plugin.dependencies) {
      const [name, version] = dep.split('@');
      const installed = this.plugins.get(name);
      
      if (!installed) {
        throw new Error(`Missing dependency: ${dep}`);
      }

      if (version && installed.version !== version) {
        console.warn(`Dependency version mismatch: ${dep}`);
      }
    }
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取启用的插件
   */
  getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins().filter(p => p.enabled);
  }

  /**
   * 执行命令
   */
  async executeCommand(command: string, args: any[]): Promise<any> {
    const handler = this.commands.get(command);
    if (!handler) {
      throw new Error(`Command not found: ${command}`);
    }

    return await handler(...args);
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalPlugins: number;
    enabledPlugins: number;
    totalCommands: number;
  } {
    const plugins = this.getAllPlugins();
    return {
      totalPlugins: plugins.length,
      enabledPlugins: plugins.filter(p => p.enabled).length,
      totalCommands: this.commands.size,
    };
  }
}

/**
 * 创建插件管理器
 */
export function createPluginManager(): PluginManager {
  return new PluginManager();
}

export default PluginManager;
