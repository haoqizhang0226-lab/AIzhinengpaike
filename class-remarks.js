(() => {
  const markedClassNumbers = new Set([
    '01077801261106-0001',
    '01077801261028-0004',
    '01077837261019-0001',
    '01077801261114-0074',
    '070119201261114-0004',
    '01077801261114-0072'
  ]);
  const remark = '虚拟订单，将于3d25m30s后关闭';
  const closedClassNumbers = new Set(['01077801261114-0075']);
  window.smartClassRemark = record => {
    const type = String(record?.classType || record?.type || '').toLowerCase();
    if (/^1v1(?:试听)?$/.test(type) && record?.status === '已关闭' && closedClassNumbers.has(String(record?.number || ''))) return '超时未付款，系统自动关闭';
    return /^1v1(?:试听)?$/.test(type) && markedClassNumbers.has(String(record?.number || '')) ? remark : '--';
  };
})();
