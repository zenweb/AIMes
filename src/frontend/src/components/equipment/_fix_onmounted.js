const fs = require('fs');
let content = fs.readFileSync('EquipmentBoard.vue', 'utf-8');
const oldMatch = content.match(/onMounted\(async \(\) => \{[\s\S]*?\n\}\)/);
if (oldMatch) {
  const newBlock = [
    'onMounted(async () => {',
    '  try {',
    '    const s = await getEquipmentStatistics()',
    '    Object.assign(stats, s)',
    '  } catch {',
    '    Object.assign(stats, { totalCount: 8, runningCount: 4, idleCount: 3, maintenanceCount: 0, faultCount: 1, offlineCount: 0, utilizationRate: 72, availabilityRate: 95 })',
    '  }',
    '  await loadEquipment()',
    '})'
  ].join('\n');
  content = content.replace(oldMatch[0], newBlock);
  fs.writeFileSync('EquipmentBoard.vue', content, 'utf-8');
  console.log('Replaced onMounted block');
} else {
  console.log('Pattern not found');
}
