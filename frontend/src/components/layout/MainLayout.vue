<template>
  <div class="main-layout">
    <header class="topbar">
      <div class="logo">MES 排产系统</div>
      <nav class="nav">
        <router-link to="/scheduling" class="nav-link active">
          排产甘特图
        </router-link>
      </nav>
    </header>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: #333;
  background: #f5f5f5;
}

/* dhtmlx-gantt 全局样式调整 */
.gantt_task_line.gantt-task-conflict {
  border-color: #ff4d4f !important;
  background: #ffccc7 !important;
}

.gantt_task_line.gantt-task-scheduled {
  border-color: #91d5ff;
  background: #bae7ff;
}

.gantt_task_line.gantt-task-bottleneck {
  border-color: #ffa39e;
  background: #ffccc7;
}

.gantt_task_line.gantt-task-bottleneck .gantt_task_content {
  font-weight: 600;
}

.gantt_tree_content {
  font-size: 13px;
}

/* 冲突任务: 红色边框 + 斜线背景 */
.gantt_task_line.gantt-task-conflict {
  border-color: #ff4d4f !important;
  background: repeating-linear-gradient(
    45deg,
    #ffccc7,
    #ffccc7 4px,
    #ffd8bf 4px,
    #ffd8bf 8px
  ) !important;
  box-shadow: 0 0 6px rgba(255, 77, 79, 0.5) !important;
}
</style>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.topbar {
  height: 50px;
  background: #001529;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 32px;
}

.logo {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.content {
  flex: 1;
  overflow: hidden;
}
</style>
