const t = "ehll oowrld".split("");
const n = 2;
for (let i = 0; i < t.length; i++) {
  [t[n], t[n + 1]] = [t[n], t[n + 1]];
}
console.log(t.join(""));
