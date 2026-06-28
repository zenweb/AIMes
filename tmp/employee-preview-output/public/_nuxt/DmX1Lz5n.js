function l(n,e,s){const r=[e.map(o).join(","),...s.map(i=>i.map(o).join(","))].join(`
`),u="\uFEFF",d=new Blob([u+r],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(d),t=document.createElement("a");t.href=c,t.download=n.endsWith(".csv")?n:`${n}.csv`,document.body.appendChild(t),t.click(),document.body.removeChild(t),URL.revokeObjectURL(c)}function o(n){if(n==null)return"";const e=String(n);return e.includes(",")||e.includes('"')||e.includes(`
`)?`"${e.replace(/"/g,'""')}"`:e}export{l as e};
