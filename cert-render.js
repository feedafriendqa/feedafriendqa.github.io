// Shared certificate renderer (canvas -> PDF). Used by the admin console (volunteer.html).
// Needs the jsPDF UMD build and the Google Fonts: Poppins, Great Vibes, Mr De Haviland.
(function(){
  const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  const monthYear = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '';

  async function drawCertificate(c) {
    await Promise.all([
      document.fonts.load('800 73px "Poppins"'), document.fonts.load('400 20px "Poppins"'),
      document.fonts.load('italic 400 19px "Poppins"'), document.fonts.load('700 16px "Poppins"'),
      document.fonts.load('73px "Great Vibes"'), document.fonts.load('46px "Mr De Haviland"')
    ]);
    const logo = await loadImg('faf-logo.png');
    const W = 1123, H = 794, S = 2, K = 0.96;
    const cv = document.createElement('canvas');
    cv.width = W * S; cv.height = H * S;
    const g = cv.getContext('2d');
    g.scale(S, S);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);

    const GREEN = '#07622e', LIGHT = '#5ab682', DEEP = '#044922';
    g.strokeStyle = LIGHT; g.lineWidth = 5; g.strokeRect(50, 58, 1047, 710);

    const poly = (pts, fill) => {
      g.beginPath();
      pts.forEach((p, i) => i ? g.lineTo(p[0] * K, p[1] * K) : g.moveTo(p[0] * K, p[1] * K));
      g.closePath(); g.fillStyle = fill; g.fill();
      g.lineWidth = 6; g.strokeStyle = '#fff'; g.lineJoin = 'round'; g.stroke();
    };
    poly([[903,0],[1040,0],[1046,72],[905,112]], GREEN);
    poly([[1040,0],[1115,0],[1170,30],[1170,66],[1052,72]], LIGHT);
    poly([[910,114],[1046,78],[1064,160]], LIGHT);
    poly([[1052,78],[1170,70],[1170,170],[1070,152]], GREEN);
    poly([[1076,172],[1170,172],[1170,252],[1118,252]], LIGHT);
    poly([[0,628],[140,604],[50,690]], LIGHT);
    poly([[160,602],[212,712],[50,694]], GREEN);
    poly([[0,692],[46,696],[104,827],[0,827]], GREEN);
    poly([[54,700],[215,724],[215,827],[128,827]], LIGHT);
    poly([[0,760],[46,700],[96,827],[0,827]], LIGHT);

    const outline = pts => {
      g.beginPath();
      pts.forEach((p, i) => i ? g.lineTo(p[0] * K, p[1] * K) : g.moveTo(p[0] * K, p[1] * K));
      g.closePath(); g.lineWidth = 1.5; g.strokeStyle = GREEN; g.stroke();
    };
    outline([[985,196],[1010,238],[960,238]]);
    outline([[1023,284],[1047,297],[1023,310]]);
    outline([[85,425],[133,427],[107,468]]);
    outline([[88,530],[64,543],[88,557]]);

    const cx = W / 2;
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const spaced = (text, x, y, sp) => {
      const widths = [...text].map(ch => g.measureText(ch).width);
      const total = widths.reduce((a, b) => a + b, 0) + sp * (text.length - 1);
      let px = x - total / 2;
      g.textAlign = 'left';
      [...text].forEach((ch, i) => { g.fillText(ch, px, y); px += widths[i] + sp; });
      g.textAlign = 'center';
    };

    g.font = '800 73px "Poppins", sans-serif';
    g.lineWidth = 3; g.strokeStyle = DEEP; g.fillStyle = '#fff'; g.lineJoin = 'round';
    const titleW = g.measureText('CERTIFICATE').width;
    g.strokeText('CERTIFICATE', cx, 160); g.fillText('CERTIFICATE', cx, 160);
    void titleW;

    g.fillStyle = '#000';
    g.font = '400 24px "Poppins", sans-serif';
    spaced('OF PARTICIPATION', cx, 205, 6);
    g.font = '400 20px "Poppins", sans-serif';
    spaced('THIS AWARD IS PRESENTED TO', cx, 265, 1);

    let nameSize = 92;
    g.font = nameSize + 'px "Great Vibes", cursive';
    while (g.measureText(c.name).width > 880 && nameSize > 30) { nameSize -= 2; g.font = nameSize + 'px "Great Vibes", cursive'; }
    g.fillStyle = '#0d7314';
    g.fillText(c.name, cx, 398);
    g.beginPath(); g.moveTo(187, 402); g.lineTo(921, 402); g.lineWidth = 2; g.strokeStyle = DEEP; g.stroke();

    g.fillStyle = '#000';
    g.font = '400 18.67px "Poppins", sans-serif';
    const wrap = (txt, maxW) => {
      const words = txt.split(' '); const lines = []; let cur = '';
      words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
      if (cur) lines.push(cur);
      return lines;
    };
    const LH = 26.1;
    let y = 468;
    wrap(c.text, 740).forEach(l => { g.fillText(l, cx, y); y += LH; });
    y += LH * 0.55;
    g.fillText('Your efforts have made a meaningful impact on our community, embodying', cx, y); y += LH;
    const tail = 'the spirit of generosity and compassion that drives the mission of ';
    const wTail = g.measureText(tail).width;
    g.font = '700 18.67px "Poppins", sans-serif';
    const wBrand = g.measureText('Feed a Friend').width;
    g.font = '400 18.67px "Poppins", sans-serif';
    const wDot = g.measureText('.').width;
    let sx = cx - (wTail + wBrand + wDot) / 2;
    g.textAlign = 'left';
    g.fillText(tail, sx, y); sx += wTail;
    g.font = '700 18.67px "Poppins", sans-serif';
    g.fillText('Feed a Friend', sx, y); sx += wBrand;
    g.font = '400 18.67px "Poppins", sans-serif';
    g.fillText('.', sx, y);
    g.textAlign = 'center';
    y += LH * 1.7;
    g.font = 'italic 400 18.67px "Poppins", sans-serif';
    g.fillText(c.date, cx, y);

    g.drawImage(logo, 420, 240, 1180, 930, 268, 592, 130, 103);

    g.beginPath(); g.moveTo(703, 651); g.lineTo(883, 651); g.lineWidth = 2; g.strokeStyle = '#000'; g.stroke();
    g.globalAlpha = 0.85; g.fillStyle = '#000';
    g.font = '60px "Mr De Haviland", cursive';
    g.fillText('A.Choudhury', 793, 644);
    g.globalAlpha = 1;
    g.font = '700 16px "Poppins", sans-serif';
    g.fillText('Alliyah Choudhury', 797, 680);
    g.font = '400 16px "Poppins", sans-serif';
    g.fillText('FOUNDER', 797, 703);
    return cv;
  }

  // c = { name, text, when:'YYYY-MM-DD', file }
  async function download(c) {
    const cv = await drawCertificate({ name: c.name, text: c.text, date: monthYear(c.when) });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 794], compress: true });
    pdf.addImage(cv.toDataURL('image/png'), 'PNG', 0, 0, 1123, 794);
    pdf.save(('Feed a Friend - ' + c.file + ' certificate - ' + c.name).replace(/[^\w\- ]+/g, '') + '.pdf');
  }
  window.fafCertificate = { draw: drawCertificate, download, monthYear };
})();
