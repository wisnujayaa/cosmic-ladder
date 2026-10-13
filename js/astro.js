window.ASTRO=(()=>{
const DEG=Math.PI/180, AU=1.495978707e11, LY=9.4607304725808e15;
const J2000=Date.UTC(2000,0,1,12,0,0);
/* JPL "Keplerian Elements for Approximate Positions of the Major Planets" (1800–2050 AD):
   a [AU], e, I [deg], L [deg], long. perihelion [deg], long. asc. node [deg]; second row: rates per Julian century */
const EL={
 Merkurius:[[0.38709927,0.20563593,7.00497902,252.25032350,77.45779628,48.33076593],[0.00000037,0.00001906,-0.00594749,149472.67411175,0.16047689,-0.12534081]],
 Venus:[[0.72333566,0.00677672,3.39467605,181.97909950,131.60246718,76.67984255],[0.00000390,-0.00004107,-0.00078890,58517.81538729,0.00268329,-0.27769418]],
 Bumi:[[1.00000261,0.01671123,-0.00001531,100.46457166,102.93768193,0.0],[0.00000562,-0.00004392,-0.01294668,35999.37244981,0.32327364,0.0]],
 Mars:[[1.52371034,0.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],[0.00001847,0.00007882,-0.00813131,19140.30268499,0.44441088,-0.29257343]],
 Jupiter:[[5.20288700,0.04838624,1.30439695,34.39644051,14.72847983,100.47390909],[-0.00011607,-0.00013253,-0.00183714,3034.74612775,0.21252668,0.20469106]],
 Saturnus:[[9.53667594,0.05386179,2.48599187,49.95424423,92.59887831,113.66242448],[-0.00125060,-0.00050991,0.00193609,1222.49362201,-0.41897216,-0.28867794]],
 Uranus:[[19.18916464,0.04725744,0.77263783,313.23810451,170.95427630,74.01692503],[-0.00196176,-0.00004397,-0.00242939,428.48202785,0.40805281,0.04240589]],
 Neptunus:[[30.06992276,0.00859048,1.77004347,-55.12002969,44.96476227,131.78422574],[0.00026291,0.00005105,0.00035372,218.45945325,-0.32241464,-0.00508664]],
 Pluto:[[39.48211675,0.24882730,17.14001206,238.92903833,224.06891629,110.30393684],[-0.00031596,0.00005170,0.00004818,145.20780515,-0.04062942,-0.01183482]]
};
const wrap180=x=>{x%=360;if(x>180)x-=360;if(x<-180)x+=360;return x};
function kepler(M,e){let E=e>0.8?Math.PI*Math.sign(M||1):M+e*Math.sin(M);for(let k=0;k<6;k++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));return E}
/* orbital-plane basis -> ecliptic; w=arg perihelion, O=node, i=incl (radians) */
function basis(w,O,i){const cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(O),sO=Math.sin(O),ci=Math.cos(i),si=Math.sin(i);
  return[cw*cO-sw*sO*ci,cw*sO+sw*cO*ci,sw*si, -sw*cO-cw*sO*ci,-sw*sO+cw*cO*ci,cw*si]}
function elemPos(a,e,I,L,lp,node){const M=wrap180(L-lp)*DEG,E=kepler(M,e);const xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E);
  const b=basis((lp-node)*DEG,node*DEG,I*DEG);return[b[0]*xp+b[3]*yp,b[1]*xp+b[4]*yp,b[2]*xp+b[5]*yp]}
function planetEcl(name,d){const[b,r]=EL[name];const T=d/36525,Tc=Math.max(-10,Math.min(10,T));
  return elemPos(b[0]+r[0]*Tc,b[1]+r[1]*Tc,b[2]+r[2]*Tc,(b[3]+r[3]*T)%360,b[4]+r[4]*Tc,b[5]+r[5]*Tc)}
function orbitPts(name,n){const[b]=EL[name];const[a,e,I,,lp,node]=b;const B=basis((lp-node)*DEG,node*DEG,I*DEG);const out=[];
  for(let k=0;k<=n;k++){const E=k/n*2*Math.PI;const xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E);out.push(B[0]*xp+B[3]*yp,B[1]*xp+B[4]*yp,B[2]*xp+B[5]*yp)}return out}
/* Moon: mean elements (circular, error up to a few degrees) -> geocentric ecliptic km */
function moonEcl(d){const L=(218.3165+13.17639648*d)*DEG,O=(125.0446-0.0529538083*d)*DEG,i=5.145*DEG,u=L-O,r=384400;
  return[r*(Math.cos(O)*Math.cos(u)-Math.sin(O)*Math.sin(u)*Math.cos(i)),r*(Math.sin(O)*Math.cos(u)+Math.cos(O)*Math.sin(u)*Math.cos(i)),r*Math.sin(u)*Math.sin(i)]}
const gmst=d=>((280.46061837+360.98564736629*d)%360)*DEG;
/* frames */
const eps=23.4392911*DEG,ce=Math.cos(eps),se=Math.sin(eps);
const ECL2EQ=[[1,0,0],[0,ce,-se],[0,se,ce]];
const EQ2GAL=[[-0.0548755604,-0.8734370902,-0.4838350155],[0.4941094279,-0.4448296300,0.7469822445],[-0.8676661490,-0.1980763734,0.4559837762]];
const GAL2THREE=[[1,0,0],[0,0,1],[0,-1,0]];
const mm=(A,B)=>A.map(r=>[0,1,2].map(j=>r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j]));
const mv=(A,v)=>[A[0][0]*v[0]+A[0][1]*v[1]+A[0][2]*v[2],A[1][0]*v[0]+A[1][1]*v[1]+A[1][2]*v[2],A[2][0]*v[0]+A[2][1]*v[1]+A[2][2]*v[2]];
const tr=A=>[0,1,2].map(i=>[A[0][i],A[1][i],A[2][i]]);
const M_GAL=GAL2THREE, M_EQ=mm(GAL2THREE,EQ2GAL), M_ECL=mm(M_EQ,ECL2EQ);
const sph=(lonDeg,latDeg)=>{const a=lonDeg*DEG,b=latDeg*DEG;return[Math.cos(b)*Math.cos(a),Math.cos(b)*Math.sin(a),Math.sin(b)]};
const eqToEcl=v=>mv(tr(ECL2EQ),v);
const galToEq=v=>mv(tr(EQ2GAL),v);
return{DEG,AU,LY,J2000,EL,kepler,basis,planetEcl,orbitPts,moonEcl,gmst,ECL2EQ,EQ2GAL,M_GAL,M_EQ,M_ECL,mv,mm,tr,sph,eqToEcl,galToEq,eps};
})();
