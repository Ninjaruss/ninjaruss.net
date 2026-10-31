// Original illustrated geography, compressed for destination selection, not a
// boundary dataset. Orientation checked against the JNTO Fukuoka city map:
// https://partners-pamph.jnto.go.jp/simg/pamph/690.pdf
export const FUKUOKA_AREAS = [
  { key:'fukuoka-nishi', name:'Nishi', japanese:'西区', x:140, y:370 },
  { key:'fukuoka-sawara', name:'Sawara', japanese:'早良区', x:295, y:465 },
  { key:'fukuoka-chuo', name:'Chuo', japanese:'中央区', x:465, y:453 },
  { key:'fukuoka-jonan', name:'Jonan', japanese:'城南区', x:425, y:545 },
  { key:'fukuoka-minami', name:'Minami', japanese:'南区', x:615, y:567 },
  { key:'fukuoka-hakata', name:'Hakata', japanese:'博多区', x:715, y:492 },
  { key:'fukuoka-higashi', name:'Higashi', japanese:'東区', x:840, y:245 },
];
export const FUKUOKA_KEYS = new Set(['fukuoka', ...FUKUOKA_AREAS.map(area=>area.key)]);

const land = 'M-30 238 50 247 105 280 150 290 185 273 235 276 262 296 289 290 302 308 345 310 363 324 405 323 428 334 473 326 495 313 538 317 557 303 573 298 580 275 595 275 598 303 623 299 628 275 640 271 650 292 674 280 693 265 706 233 731 205 756 190 772 153 776 109 799 80 819 65 837 26 879 -15 1040 -15 1040 700 -30 700Z';
const streets = [
  'M-10 354 175 340 295 350 418 352 505 351 580 338 666 321 731 270 823 177 919 104',
  'M33 420 175 407 307 401 422 420 530 421 620 404 721 390 846 353 1005 309',
  'M50 495 175 475 299 478 422 486 532 475 626 480 744 478 905 464 1010 458',
  'M207 302 210 374 243 470 281 584',
  'M334 328 339 393 369 480 417 622',
  'M492 333 489 402 517 471 545 620',
  'M662 298 642 366 651 428 700 506 760 616',
  'M781 195 802 285 815 358 864 442 919 550',
];
const roofColors = ['#d9ceb0','#c0b293','#b6aaa0','#d8c7a0','#a2a699'];
function block(x,y,w,h,index) {
  return `<g transform="translate(${x} ${y})"><path class="map-building-side" d="M0 0 ${w} 0 ${w+5} 5 5 5 5 ${h+5} 0 ${h}Z"/><path fill="${roofColors[index%roofColors.length]}" class="map-building-roof" d="M0 -${h} ${w} -${h} ${w} 0 0 0Z"/><path class="map-building-edge" d="M${w} -${h} ${w+5} ${5-h} ${w+5} 5 ${w} 0Z"/></g>`;
}
function neighborhoods() {
  // Hand-arranged city clusters; generated blocks are illustration, never venues.
  const clusters = [[65,320,7,5],[245,352,5,5],[366,410,6,5],[475,352,7,6],[640,350,6,7],[800,276,8,5],[735,515,7,4],[505,505,5,4]];
  return clusters.map(([ox,oy,cols,rows],k)=>Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=> {
    const index=k*13+r*7+c;
    if(index%9===0) return '';
    return block(ox+c*19+(r%2)*3,oy+r*19,10+index%5,6+index%7,index);
  }).join('')).join('')).join('');
}
const landmark = (name,x,y,art,labelX=0,labelY=33) => `<g class="map-landmark" transform="translate(${x} ${y})">${art}<text class="map-landmark-name" x="${labelX}" y="${labelY}" text-anchor="middle">${name}</text></g>`;

export function renderFukuokaScene() {
  return `<g class="map-scenery" aria-hidden="true">
    <path class="map-sea" d="M0 0H1000V650H0Z"/>
    <g class="map-water-lines"><path d="M-20 90Q190 35 400 95T780 70M-20 125Q190 70 400 130T750 108M-20 160Q190 105 400 165T720 146M-20 195Q190 140 400 200T688 184"/><path d="M80 65h85m320 150h90m-215 35h65m220-115h70"/></g>
    <path class="map-island" d="M215 148 243 114 264 116 285 141 279 173 255 192 227 182Z"/>
    <path class="map-island" d="M589 37 621 9 643 25 659 73 654 98 629 110 611 82Z"/>
    <path class="map-land-shadow" d="${land}" transform="translate(0 8)"/>
    <path class="map-land" d="${land}"/>
    <path class="map-hills" d="M-20 459 48 438 84 451 107 430 157 458 182 484 204 474 249 513 291 554 336 562 353 602 411 588 459 627 1000 624 1020 690H-20Z"/>
    <g class="map-contours"><path d="M-20 485Q59 456 106 477T215 508T330 590M-20 513Q67 482 117 505T224 541T309 600M-20 545Q67 516 122 539T228 578M18 592Q72 557 128 581T225 614"/><path d="M691 655Q772 589 846 603T1020 580M735 655Q800 621 873 626T1020 607"/></g>
    <g class="map-minor-roads">${streets.map(d=>`<path d="${d}"/>`).join('')}</g>
    <g class="map-blocks">${neighborhoods()}</g>
    <g class="map-parks"><path d="M342 352 394 347 429 370 426 400 392 410 348 392Z"/><path d="M421 361 453 361 461 389 437 403 418 392Z"/><path d="M277 305 318 310 320 331 281 328Z"/><path d="M757 206 777 202 797 232 779 250 762 233Z"/></g>
    <path class="map-lake" d="M358 360Q382 344 394 361L400 384Q389 403 368 389Z"/>
    <path class="map-park-path" d="M375 352 381 366 377 382 383 399"/>
    <path class="map-river-edge" d="M580 650Q592 596 580 549T574 471L600 421 598 387 609 348 597 306"/>
    <path class="map-river" d="M580 650Q592 596 580 549T574 471L600 421 598 387 609 348 597 306"/>
    <path class="map-river" d="M616 401 629 374 633 344 621 301"/>
    <g class="map-highway"><path d="M-10 333 177 323 296 338 420 338 510 337 570 325 674 308 712 265 830 156 929 87 1010 81"/><path d="M603 321 622 371 669 407 755 448 805 504 833 575 841 650"/></g>
    <g class="map-road-centers"><path d="M-10 333 177 323 296 338 420 338 510 337 570 325 674 308 712 265 830 156 929 87 1010 81"/><path d="M603 321 622 371 669 407 755 448 805 504 833 575 841 650"/></g>
    <path class="map-rail" d="M550 650 551 574 569 494 617 446 679 420 743 370 779 305 812 253 840 187 873 115 940 30"/>
    <path class="map-rail-ties" d="M550 650 551 574 569 494 617 446 679 420 743 370 779 305 812 253 840 187 873 115 940 30"/>
    <g class="map-bridges"><path d="M567 420h54m-60 57h29m-43 72h41m7-184h41"/></g>
    ${landmark('Fukuoka Tower',290,296,'<path class="map-icon-shadow" d="M-8 13 10 18 22 11 0 5Z"/><path class="map-tower" d="M-7 10 -3 -44 0 -58 4 -43 8 10Z"/><path class="map-icon-line" d="M-5 -24h10m-9 12h8M0 -53V9"/>',-13,-65)}
    ${landmark('Dome',339,324,'<ellipse class="map-dome-wall" cx="0" cy="0" rx="24" ry="14"/><path class="map-dome" d="M-24 -4Q-25 -28 0 -29 25 -27 24 -4Q0 13 -24 -4Z"/><path class="map-icon-line" d="M-19 -10Q0 -25 19 -10"/>',0,30)}
    ${landmark('Ohori Park',377,379,'<path class="map-icon-line" d="m-5 -4 12 -7m-12 20 14 -5"/>',54,-3)}
    ${landmark('Tenjin',537,374,'<path class="map-station" d="M-18 -12h36v21h-36Z"/><path class="map-icon-line" d="M-12 -6h24m-24 7h24"/>',0,-24)}
    ${landmark('Nakasu',613,378,'<path class="map-islet" d="m-2 -25 12 18 -9 37 -8 -20Z"/>',26,-22)}
    ${landmark('Hakata Station',688,419,'<path class="map-station-side" d="m-31 -7 8 10h55v12h-63Z"/><path class="map-station" d="m-31 -17 57 0 6 10h-55Z"/><path class="map-icon-line" d="M-19 -13h39"/>',20,-30)}
    ${landmark('Fukuoka Airport',822,466,'<g transform="rotate(-34)"><path class="map-airfield" d="M-18 -67h36V75h-36Z"/><path class="map-runway" d="M-7 -57H7V64H-7Z"/><path class="map-runway-line" d="M0 -50V58"/><path class="map-plane" d="m0 -14 3 13 12 8v4L3 7 2 18l4 4v3l-6 -2 -6 2v-3l4 -4 -1 -11 -12 4V7l12 -8Z"/></g>',19,87)}
    <text class="map-bay-name" x="442" y="175" text-anchor="middle">Hakata Bay</text>
    <text class="map-bay-japanese" x="442" y="201" text-anchor="middle">博多湾</text>
    <g class="map-compass" transform="translate(944 563)"><path d="m0 -21 -9 25 9 -6 9 6Z"/><path d="M0 -16V17"/><text x="0" y="-31" text-anchor="middle">N</text></g>
  </g>`;
}
