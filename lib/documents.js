import { Document, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

// This module reproduces the text and structure of New York's official
// Uncontested Divorce Packet forms (Rev. 3/1/26), sourced from
// nycourts.gov. These are NOT fillable PDF forms on the court's own
// site — they're plain documents with blank lines — so reproducing the
// official language in Word, populated with client data, is the standard
// and accurate way preparers complete them.

const CHECK = '☒';
const BOX = '☐';

function box(checked) { return checked ? CHECK : BOX; }

function caption(county, indexNo, p1Name, p2Name, captionTitle) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'SUPREME COURT OF THE STATE OF NEW YORK', bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `COUNTY OF ${county || '_____________________'}`, bold: true })] }),
    new Paragraph({ text: '' }),
    new Paragraph({ children: [new TextRun(`${p1Name || '_____________________'},`)] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(`Index No.: ${indexNo || '_____________________'}`)] }),
    new Paragraph({ children: [new TextRun('                                    Plaintiff,')] }),
    new Paragraph({ children: [new TextRun('        -against-')] }),
    new Paragraph({ children: [new TextRun(`${p2Name || '_____________________'},`)] }),
    new Paragraph({ children: [new TextRun('                                    Defendant.')] }),
    new Paragraph({ text: '' }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: captionTitle, bold: true })] }),
    new Paragraph({ text: '' }),
  ];
}

function p(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 160 } });
}

// Maps our simplified intake residency answer onto the official
// complaint's four residency clauses (SECOND, paragraphs A-D).
function residencyClause(data) {
  const r = data.residency;
  if (r === 'One spouse has lived in NY 2+ years') {
    return `${box(true)} A) A party has resided in New York State for a continuous period of at least two years immediately preceding the commencement of this divorce action. [PREPARER: confirm and name which spouse]`;
  }
  if (r === 'One spouse has lived in NY 1+ year') {
    return `${box(true)} B) A party resided in New York State on the date of commencement of this divorce action and for a continuous period of one year immediately preceding commencement, AND the parties were married in New York State or have resided as married persons in New York State. [PREPARER: confirm and name which spouse]`;
  }
  if (r === 'Both spouses live in NY') {
    return `${box(true)} D) The cause of action occurred in New York State and both parties were residents at the time of commencement of this divorce action. [PREPARER: confirm cause of action occurred in NY]`;
  }
  return `[PREPARER REVIEW REQUIRED: residency basis not yet confirmed with client — see intake notes]`;
}

function ancillaryRelief(data) {
  const lines = [];
  if (data.hasProperty === 'Yes' || data.hasDebts === 'Yes') {
    lines.push(`${box(true)} Marital property to be distributed pursuant to separation agreement/stipulation.`);
  } else {
    lines.push(`${box(true)} I waive distribution of Marital property.`);
  }
  if (data.maintenance === 'Yes') {
    lines.push(`${box(true)} I seek maintenance as payee, as described in the Notice of Guideline Maintenance.`);
  } else {
    lines.push(`${box(true)} I am not seeking maintenance as payee other than what was already agreed to in a written agreement/stipulation.`);
  }
  return lines;
}

export function buildSummonsWithNotice(data, meta = {}) {
  const children = [
    ...caption(meta.county, meta.indexNo, data.p1Name, data.p2Name, 'SUMMONS WITH NOTICE'),
    p('ACTION FOR A DIVORCE', { bold: true }),
    p(''),
    p('To the above named Defendant:'),
    p('YOU ARE HEREBY SUMMONED to serve a notice of appearance on the Plaintiff or Plaintiff\'s Attorney(s) within twenty (20) days after service of this summons, exclusive of the day of service (or within thirty (30) days after service is complete if this summons is not personally delivered to you within the State of New York); and in case of your failure to appear, judgment will be taken against you by default for the relief demanded in the notice set forth below.'),
    p(`Dated: ${meta.dateSigned || '_____________________'}`),
    p(`${data.p1Name || 'Plaintiff'}`),
    p(`Address: ${data.p1Address || '_____________________'}`),
    p(''),
    p(`NOTICE: The nature of this action is to dissolve the marriage between the parties, on the grounds: ${box(true)} DRL §170 subd. (7) - Irretrievable breakdown in relationship for at least six months.`),
    p('The relief sought is a judgment of absolute divorce in favor of the Plaintiff dissolving the marriage between the parties in this action.'),
    p('The nature of any ancillary or additional relief requested is:'),
    ...ancillaryRelief(data).map(t => p(t)),
  ];
  return new Document({ sections: [{ children }] });
}

export function buildVerifiedComplaint(data, meta = {}) {
  const childrenRows = (data.children || []).map(c =>
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph(c.name || '')] }),
      new TableCell({ children: [new Paragraph(c.dob || '')] }),
    ]})
  );

  const body = [
    ...caption(meta.county, meta.indexNo, data.p1Name, data.p2Name, 'VERIFIED COMPLAINT — ACTION FOR DIVORCE'),
    p('FIRST: Plaintiff, complaining of the Defendant, alleges that the parties are over the age of 18 years; and'),
    p(`SECOND: ${residencyClause(data)}`),
    p(`THIRD: The Plaintiff and the Defendant were married on ${data.marriageDate || '_____________'} in ${data.marriagePlace || '_____________________'}.`),
    p(`${box(true)} To the best of my knowledge I have taken all steps solely within my power to remove any barrier to the Defendant's remarriage.`),
    p(`FOURTH: ${data.hasChildren === 'Yes'
        ? `There is/are ${data.children?.length || 0} child(ren) of the marriage, namely:`
        : `${box(true)} There are no children of the marriage.`}`),
  ];

  if (data.hasChildren === 'Yes' && childrenRows.length) {
    body.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Name', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Date of Birth', bold: true })] })] }),
        ]}),
        ...childrenRows
      ]
    }));
    body.push(p(''));
  }

  body.push(
    p('FIFTH: The grounds for divorce alleged are as follows:'),
    p(`${box(true)} Irretrievable Breakdown in Relationship for at Least Six Months (DRL §170(7)): That the relationship between Plaintiff and Defendant has broken down irretrievably for a period of at least six months.`),
    p('SIXTH: There is no judgment of divorce and no other matrimonial action between the parties pending in this court or in any other court of competent jurisdiction.'),
    p('WHEREFORE, Plaintiff demands judgment against the Defendant dissolving the marriage between the parties, AND:'),
    ...ancillaryRelief(data).map(t => p(t)),
    p(''),
    p(`Dated: ${meta.dateSigned || '_____________________'}`),
    p(`${data.p1Name || 'Plaintiff'}`),
    p(''),
    p('VERIFICATION', { bold: true }),
    p(`I, ${data.p1Name || '_____________________'}, the Plaintiff in the above action for divorce, affirm under penalty of perjury under the laws of New York that I have read the foregoing complaint and know the contents thereof, and that the contents are true to my knowledge except as to matters alleged on information and belief, which I believe to be true.`),
    p(''),
    p('_____________________________'),
    p('Plaintiff\'s Signature'),
  );

  return new Document({ sections: [{ children: body }] });
}

export function buildSwornAffirmationOfPlaintiff(data, meta = {}) {
  const p1SSN = meta.p1SSN || '[ENCRYPTED — see dashboard]';
  const p2SSN = meta.p2SSN || '[ENCRYPTED — see dashboard]';

  const childLines = (data.children || []).map(c =>
    p(`${c.name || '_____________________'}     DOB: ${c.dob || '_____________'}`)
  );

  const body = [
    ...caption(meta.county, meta.indexNo, data.p1Name, data.p2Name, 'SWORN AFFIRMATION OF PLAINTIFF'),
    p(`1. The Plaintiff's address is ${data.p1Address || '_____________________'}, and social security number is ${p1SSN}. The Defendant's address is ${data.p2Address || '_____________________'}, and social security number is ${p2SSN}.`),
    p(`2. ${residencyClause(data)}`),
    p(`3. I married the Defendant on ${data.marriageDate || '___/___/______'} in ${data.marriagePlace || '_____________________'}.`),
    p(`${box(true)} To the best of my knowledge I swear that I have taken all steps solely within my power to remove any barrier to the Defendant's remarriage.`),
    p(`4. ${data.hasChildren === 'Yes' ? `There is/are ${data.children?.length || 0} child(ren) of the marriage under the age of 21:` : `${box(true)} There are no children of the marriage under the age of 21.`}`),
    ...childLines,
    p(''),
    p('5. The grounds for dissolution of the marriage are as follows:'),
    p(`${box(true)} Irretrievable Breakdown in Relationship for at Least Six Months (DRL §170(7)): I swear that the relationship between Plaintiff and Defendant has broken down irretrievably for a period of at least six months.`),
    p('6b. Plaintiff hereby affirms that all economic issues of equitable distribution, spousal support, child support, and custody/visitation:'),
    p(`${box(true)} A. have been resolved by the parties and are to be incorporated into the Judgment of Divorce, by written Settlement/Separation Agreement. [PREPARER: confirm and attach agreement]`),
    p('7. [PREPARER TO CONFIRM WITH CLIENT] Defendant\'s military service status.'),
    p('8. [PREPARER TO CONFIRM WITH CLIENT] Public assistance status for both parties.'),
    p('9. No other matrimonial action is pending in this court or any other court, and the marriage has not been terminated by any decree of any court of competent jurisdiction.'),
    p(''),
    p(`I, ${data.p1Name || '_____________________'}, affirm under the penalties of perjury under the laws of New York that the foregoing is true, except as to matters alleged on information and belief, which I believe to be true.`),
    p(''),
    p('_____________________________'),
    p('Plaintiff\'s Signature'),
  ];

  return new Document({ sections: [{ children: body }] });
}
