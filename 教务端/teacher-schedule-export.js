(() => {
  'use strict';
  const xmlEscape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
  const htmlEscape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const columnName=index=>{
    let result='';
    for(let value=index+1;value>0;value=Math.floor((value-1)/26)) result=String.fromCharCode(65+(value-1)%26)+result;
    return result;
  };
  function workbookXml(rows) {
    const sheetRows=rows.map((row,rowIndex)=>`<row r="${rowIndex+1}">${row.map((value,columnIndex)=>`<c r="${columnName(columnIndex)}${rowIndex+1}" s="0" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`).join('')}</row>`).join('');
    const maxColumns=Math.max(2,...rows.map(row=>row.length));
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="32"/><cols><col min="1" max="1" width="19" customWidth="1"/><col min="2" max="${maxColumns}" width="31" customWidth="1"/></cols><sheetData>${sheetRows}</sheetData></worksheet>`;
  }
  function zipStored(files) {
    const encoder=new TextEncoder();
    const output=[],central=[];
    let offset=0,centralLength=0;
    const crc32=bytes=>{
      let crc=0xffffffff;
      for(const byte of bytes) {
        crc^=byte;
        for(let bit=0;bit<8;bit++) crc=(crc>>>1)^((crc&1)?0xedb88320:0);
      }
      return (crc^0xffffffff)>>>0;
    };
    for(const [name,content] of files) {
      const nameBytes=encoder.encode(name),data=encoder.encode(content),crc=crc32(data);
      const local=new Uint8Array(30),localView=new DataView(local.buffer);
      localView.setUint32(0,0x04034b50,true);
      localView.setUint16(4,20,true);
      localView.setUint16(6,0x0800,true);
      localView.setUint32(14,crc,true);
      localView.setUint32(18,data.length,true);
      localView.setUint32(22,data.length,true);
      localView.setUint16(26,nameBytes.length,true);
      output.push(local,nameBytes,data);
      const directory=new Uint8Array(46),directoryView=new DataView(directory.buffer);
      directoryView.setUint32(0,0x02014b50,true);
      directoryView.setUint16(4,20,true);
      directoryView.setUint16(6,20,true);
      directoryView.setUint16(8,0x0800,true);
      directoryView.setUint32(16,crc,true);
      directoryView.setUint32(20,data.length,true);
      directoryView.setUint32(24,data.length,true);
      directoryView.setUint16(28,nameBytes.length,true);
      directoryView.setUint32(42,offset,true);
      central.push(directory,nameBytes);
      centralLength+=directory.length+nameBytes.length;
      offset+=local.length+nameBytes.length+data.length;
    }
    const end=new Uint8Array(22),endView=new DataView(end.buffer);
    endView.setUint32(0,0x06054b50,true);
    endView.setUint16(8,files.length,true);
    endView.setUint16(10,files.length,true);
    endView.setUint32(12,centralLength,true);
    endView.setUint32(16,offset,true);
    return new Blob([...output,...central,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  function downloadExcel(rows,fileName) {
    const files=[
      ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
      ['_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="教师课表" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
      ['xl/styles.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Microsoft YaHei"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'],
      ['xl/worksheets/sheet1.xml',workbookXml(rows)]
    ];
    const url=URL.createObjectURL(zipStored(files));
    const link=document.createElement('a');
    link.href=url;
    link.download=fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function printPdf(title,tableHtml) {
    const popup=window.open('','_blank','width=1200,height=850');
    if(!popup) return false;
    popup.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${htmlEscape(title)}</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:"Microsoft YaHei",Arial,sans-serif;color:#1d344f}h1{font-size:18px;margin:0 0 12px}h2{font-size:13px;margin:0 0 8px}.print-week+.print-week{break-before:page}.print-week{break-inside:avoid}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #b9c7d8;padding:5px;vertical-align:top;font-size:9px;overflow-wrap:anywhere}thead .teacher-schedule-weekdays th{background:#f1f1f1}thead .teacher-schedule-dates th{background:#c6c6c6}.teacher-schedule-lesson{margin-bottom:4px}.teacher-schedule-lesson strong,.teacher-schedule-lesson span{display:block;margin-top:2px}</style></head><body><h1>${htmlEscape(title)}</h1>${tableHtml}</body></html>`);
    popup.document.close();
    popup.addEventListener('load',()=>{popup.focus();popup.print();},{once:true});
    return true;
  }
  window.teacherScheduleExport={downloadExcel,printPdf};
})();
