function O(n){return n&&n instanceof Promise}function a(n){return typeof n=="function"||n instanceof Function}const f=n=>typeof n=="function"?n():n;function m(n,t){return(e,o,r)=>{const{value:u}=r;return r.value=function(...h){try{const c=u.apply(this,h);return O(c)?c.catch(y=>{if(a(t)&&(n===void 0||y instanceof n))return t.call(null,y,this,...h);throw y}):c}catch(c){if(a(t)&&(n===void 0||c instanceof n))return t.call(null,c,this,...h);throw c}},r}}function d(n,t,e){return function(...o){try{const r=n(...o);return O(r)?r.catch(u=>{if(a(e)&&(t===void 0||u instanceof t))return e.call(null,u,this,...o);throw u}):r}catch(r){if(a(e)&&(t===void 0||r instanceof t))return e.call(null,r,this,...o);throw r}}}function k(n,t){return d(n,Error,t)}function N(n,t){return m(n,t)}function A(n){return m(Error,n)}function l(n){return{type:"ok",value:n,unwrap:()=>n,unwrapOr:()=>n,unwrapOrElse:()=>n,isErr:()=>!1,isOk:()=>!0,toOption:()=>s(n),flatMap:t=>t(n),match:t=>t.Ok(n),map:t=>{try{return l(t(n))}catch(e){return p(e)}},flatMapAsync:async t=>t(n)}}function p(n){return{type:"error",error:n,unwrap:()=>{throw n},unwrapOr:t=>t,unwrapOrElse:t=>t(n),isErr:()=>!0,isOk:()=>!1,toOption:()=>i,toJSON:()=>{throw n},flatMap:()=>p(n),match:t=>t.Err(n),map:t=>this,flatMapAsync:async()=>p(n)}}function M(n){return n&&(n.type==="ok"&&"value"in n||n.type==="error"&&"error"in n)}function S(n){return n==null?!1:typeof n=="object"&&!!n&&"type"in n&&n.type==="some"||n.type==="none"}function w(n){if(n==null)throw new Error("Some() cannot be called with null or undefined");return{type:"some",value:n,unwrap:()=>n,unwrapOrU:()=>n,unwrapOr:()=>n,isSome:()=>!0,isNone:()=>!1,map:t=>w(t(n)),flatMap:t=>t(n),flatMapAsync:async t=>t(n),okOr:t=>l(n),mapOr:(t,e)=>{const o=s(t(n));return o.isNone()?s(f(e)):o},flatten:()=>{if(S(n)&&n.isSome())return n;throw new Error("Cannot flatten a non-option value")},match:t=>t.Some(n),toJSON:()=>n,clone:()=>structuredClone(this),toString:()=>n.toString?n.toString():`Some(${n})`}}const i={type:"none",unwrap:()=>{throw new Error("Cannot unwrap None")},unwrapOr:n=>f(n),unwrapOrU:()=>{},isSome:()=>!1,isNone:()=>!0,map:()=>i,flatMap:n=>i,flatMapAsync:async n=>i,okOr:n=>p(f(n)),mapOr:(n,t)=>s(f(t)),toJSON:()=>null,flatten:()=>i,match:n=>n.None(),clone:()=>i,toString:()=>"none"};Object.freeze(i);function s(n){try{const t=f(n);return t==null?i:w(t)}catch(t){return console.error(t),i}}class b{constructor(t,e){Object.defineProperty(this,"type",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"value",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.type=t,this.value=e}match(t){return t[this.type](this.value)}is(t){return this.type===t}}function _(n,t){return new b(n,t)}export{f as BAKUtilsGetFnValue,a as BAKUtilsIsFunction,O as BAKUtilsIsPromise,N as Catcher,A as DefaultCatcher,p as Err,i as None,l as Ok,b as OneOfVariant,s as Option,w as Some,d as catcher,_ as createOneOf,k as defaultCatcher,S as isOption,M as isResult};
