import { Helper } from 'dxf';
const dxfString = `0
SECTION
2
HEADER
9
$EXTMIN
10
0.0
20
0.0
30
0.0
9
$EXTMAX
10
100.0
20
50.0
30
0.0
0
ENDSEC
0
EOF`;
const helper = new Helper(dxfString);
console.log(helper.parsed.header);
