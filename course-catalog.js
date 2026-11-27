window.prototypeCourseCatalog = (() => {
  const catalogRows = [
    ['计算机','AQA','AS','线上'],['物理','AQA','AS','线下'],['心理','AQA','AS','线下'],
    ['物理','CAIE','AS','线下'],['物理','AQA','AS','线上'],['商务','OCR','AS','线上'],
    ['计算机','OCR','AS','线上'],['经济','AQA','AS','线上'],['计算机','AQA','AS','线下'],
    ['中文','EDX','AS','线下'],['会计','EDX','AS','线下'],['化学','CAIE','AS','线上'],
    ['数学','EDX','IAL-AS','线下'],['英语','CAIE','AS','线上'],['写作','AQA','AS','线下'],
    ['听力','AQA','AS','线上'],['口语','CAIE','AS','线下'],['阅读','CAIE','AS','线上'],
    ['综合','AQA','AS','线下'],['物理','EDX','A2','线上'],['化学','EDX','A2','线下'],
    ['数学','CAIE','A2','线上'],['商务','AQA','A2','线下'],['经济','OCR','A2','线上']
  ];
  const courseHierarchy = {
    高端:{高端牛剑:['高阶笔试'],高端竞赛:['高端竞赛']},
    全日制:{全日制学校:['上海远见']},
    英联邦:{英联邦学科:['ALEVEL','GCSE','IGCSE'],英联邦语言:['托福','雅思']},
    英研:{英研课程:['英国大学课程']},
    橡沐:{橡沐学科:['美高同步']}
  };
  const divisionForSystem = system => Object.keys(courseHierarchy).find(division =>
    Object.hasOwn(courseHierarchy[division],system)) || '';
  const itemsFor = (division,system) => courseHierarchy[division]?.[system] || [];
  const courseSystems = Object.values(courseHierarchy).flatMap(group => Object.keys(group));
  function catalogFor(item) {
    let source = catalogRows;
    if (item === '托福' || item === '雅思') {
      source = ['听力','口语','阅读','写作'].flatMap(subject => [[subject,'--','--','线上'],[subject,'--','--','线下']]);
    } else if (item === '择校') {
      source = ['综合','数学','英语','物理','化学'].flatMap(subject => [[subject,'--','8年级','线下'],[subject,'--','8年级','线上']]);
    } else if (item === 'GCSE' || item === 'IGCSE') {
      source = catalogRows.filter(row => ['物理','化学','数学','英语','商务','经济'].includes(row[0]))
        .map(row => [row[0],row[1],item,row[3]]);
    } else if (item === '高阶笔试' || item === '高端竞赛' || item === '上海远见' || item === '英国大学课程' || item === '美高同步') {
      const subjects = {
        高阶笔试:['数学','物理','化学','英语'],高端竞赛:['数学','物理','化学'],
        上海远见:['数学','英语','综合'],英国大学课程:['商科','数学','英语'],
        美高同步:['数学','英语','物理','化学']
      }[item];
      source = subjects.flatMap(subject => [[subject,'--','--','线上'],[subject,'--','--','线下']]);
    }
    return source.map(([subject,board,grade,mode]) => ({subject,board,grade,mode}));
  }
  return {courseSystems, divisionForSystem, itemsFor, catalogFor};
})();
