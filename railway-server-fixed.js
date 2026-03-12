const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Serve static files with explicit CSS handling
app.use(express.static(path.join(__dirname, 'public')));

// Explicit CSS endpoint with fallback
app.get('/output.css', (req, res) => {
  const cssPath = path.join(__dirname, 'public', 'output.css');
  
  if (fs.existsSync(cssPath)) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(cssPath);
  } else {
    // Fallback inline CSS if file doesn't exist
    const fallbackCSS = `
/* Fallback Tailwind CSS */
*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}
:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }
.container{width:100%}
@media (min-width:640px){.container{max-width:640px}}
@media (min-width:768px){.container{max-width:768px}}
@media (min-width:1024px){.container{max-width:1024px}}
@media (min-width:1280px){.container{max-width:1280px}}
@media (min-width:1536px){.container{max-width:1536px}}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.pointer-events-none{pointer-events:none}
.visible{visibility:visible}
.invisible{visibility:hidden}
.static{position:static}
.fixed{position:fixed}
.absolute{position:absolute}
.relative{position:relative}
.sticky{position:sticky}
.inset-0{inset:0px}
.inset-x-0{left:0px;right:0px}
.inset-y-0{top:0px;bottom:0px}
.start-0{inset-inline-start:0px}
.end-0{inset-inline-end:0px}
.top-0{top:0px}
.right-0{right:0px}
.bottom-0{bottom:0px}
.left-0{left:0px}
.top-1{top:.25rem}
.right-1{right:.25rem}
.bottom-1{bottom:.25rem}
.left-1{left:.25rem}
.top-2{top:.5rem}
.right-2{right:.5rem}
.bottom-2{bottom:.5rem}
.left-2{left:.5rem}
.top-3{top:.75rem}
.right-3{right:.75rem}
.bottom-3{bottom:.75rem}
.left-3{left:.75rem}
.top-4{top:1rem}
.right-4{right:1rem}
.bottom-4{bottom:1rem}
.left-4{left:1rem}
.top-5{top:1.25rem}
.right-5{right:1.25rem}
.bottom-5{bottom:1.25rem}
.left-5{left:1.25rem}
.top-6{top:1.5rem}
.right-6{right:1.5rem}
.bottom-6{bottom:1.5rem}
.left-6{left:1.5rem}
.top-7{top:1.75rem}
.right-7{right:1.75rem}
.bottom-7{bottom:1.75rem}
.left-7{left:1.75rem}
.top-8{top:2rem}
.right-8{right:2rem}
.bottom-8{bottom:2rem}
.left-8{left:2rem}
.top-9{top:2.25rem}
.right-9{right:2.25rem}
.bottom-9{bottom:2.25rem}
.left-9{left:2.25rem}
.top-10{top:2.5rem}
.right-10{right:2.5rem}
.bottom-10{bottom:2.5rem}
.left-10{left:2.5rem}
.top-11{top:2.75rem}
.right-11{right:2.75rem}
.bottom-11{bottom:2.75rem}
.left-11{left:2.75rem}
.top-12{top:3rem}
.right-12{right:3rem}
.bottom-12{bottom:3rem}
.left-12{left:3rem}
.top-14{top:3.5rem}
.right-14{right:3.5rem}
.bottom-14{bottom:3.5rem}
.left-14{left:3.5rem}
.top-16{top:4rem}
.right-16{right:4rem}
.bottom-16{bottom:4rem}
.left-16{left:4rem}
.top-20{top:5rem}
.right-20{right:5rem}
.bottom-20{bottom:5rem}
.left-20{left:5rem}
.top-24{top:6rem}
.right-24{right:6rem}
.bottom-24{bottom:6rem}
.left-24{left:6rem}
.top-28{top:7rem}
.right-28{right:7rem}
.bottom-28{bottom:7rem}
.left-28{left:7rem}
.top-32{top:8rem}
.right-32{right:8rem}
.bottom-32{bottom:8rem}
.left-32{left:8rem}
.top-36{top:9rem}
.right-36{right:9rem}
.bottom-36{bottom:9rem}
.left-36{left:9rem}
.top-40{top:10rem}
.right-40{right:10rem}
.bottom-40{bottom:10rem}
.left-40{left:10rem}
.top-44{top:11rem}
.right-44{right:11rem}
.bottom-44{bottom:11rem}
.left-44{left:11rem}
.top-48{top:12rem}
.right-48{right:12rem}
.bottom-48{bottom:12rem}
.left-48{left:12rem}
.top-52{top:13rem}
.right-52{right:13rem}
.bottom-52{bottom:13rem}
.left-52{left:13rem}
.top-56{top:14rem}
.right-56{right:14rem}
.bottom-56{bottom:14rem}
.left-56{left:14rem}
.top-60{top:15rem}
.right-60{right:15rem}
.bottom-60{bottom:15rem}
.left-60{left:15rem}
.top-64{top:16rem}
.right-64{right:16rem}
.bottom-64{bottom:16rem}
.left-64{left:16rem}
.top-72{top:18rem}
.right-72{right:18rem}
.bottom-72{bottom:18rem}
.left-72{left:18rem}
.top-80{top:20rem}
.right-80{right:20rem}
.bottom-80{bottom:20rem}
.left-80{left:20rem}
.top-96{top:24rem}
.right-96{right:24rem}
.bottom-96{bottom:24rem}
.left-96{left:24rem}
.z-10{z-index:10}
.z-20{z-index:20}
.z-30{z-index:30}
.z-40{z-index:40}
.z-50{z-index:50}
.z-auto{z-index:auto}
.gap-y-0>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(0px*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(0px*var(--tw-space-y-reverse))}
.gap-x-0>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(0px*(1 - var(--tw-space-x-reverse)));margin-right:calc(0px*var(--tw-space-x-reverse))}
.gap-y-1>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.25rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.25rem*var(--tw-space-y-reverse))}
.gap-x-1>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(.25rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(.25rem*var(--tw-space-x-reverse))}
.gap-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.5rem*var(--tw-space-y-reverse))}
.gap-x-2>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(.5rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(.5rem*var(--tw-space-x-reverse))}
.gap-y-3>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.75rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.75rem*var(--tw-space-y-reverse))}
.gap-x-3>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(.75rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(.75rem*var(--tw-space-x-reverse))}
.gap-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem*var(--tw-space-y-reverse))}
.gap-x-4>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(1rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(1rem*var(--tw-space-x-reverse))}
.gap-y-5>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1.25rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1.25rem*var(--tw-space-y-reverse))}
.gap-x-5>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(1.25rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(1.25rem*var(--tw-space-x-reverse))}
.gap-y-6>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1.5rem*var(--tw-space-y-reverse))}
.gap-x-6>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(1.5rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(1.5rem*var(--tw-space-x-reverse))}
.gap-y-7>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1.75rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1.75rem*var(--tw-space-y-reverse))}
.gap-x-7>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(1.75rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(1.75rem*var(--tw-space-x-reverse))}
.gap-y-8>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(2rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(2rem*var(--tw-space-y-reverse))}
.gap-x-8>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(2rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(2rem*var(--tw-space-x-reverse))}
.grid{display:grid}
.flex{display:flex}
.inline-flex{display:inline-flex}
.table{display:table}
.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
.grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}
.grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}
.grid-cols-7{grid-template-columns:repeat(7,minmax(0,1fr))}
.grid-cols-8{grid-template-columns:repeat(8,minmax(0,1fr))}
.grid-cols-9{grid-template-columns:repeat(9,minmax(0,1fr))}
.grid-cols-10{grid-template-columns:repeat(10,minmax(0,1fr))}
.grid-cols-11{grid-template-columns:repeat(11,minmax(0,1fr))}
.grid-cols-12{grid-template-columns:repeat(12,minmax(0,1fr))}
.col-span-1{grid-column:span 1/span 1}
.col-span-2{grid-column:span 2/span 2}
.col-span-3{grid-column:span 3/span 3}
.col-span-4{grid-column:span 4/span 4}
.col-span-5{grid-column:span 5/span 5}
.col-span-6{grid-column:span 6/span 6}
.col-span-7{grid-column:span 7/span 7}
.col-span-8{grid-column:span 8/span 8}
.col-span-9{grid-column:span 9/span 9}
.col-span-10{grid-column:span 10/span 10}
.col-span-11{grid-column:span 11/span 11}
.col-span-12{grid-column:span 12/span 12}
.flex-col{flex-direction:column}
.flex-wrap{flex-wrap:wrap}
.items-start{align-items:flex-start}
.items-end{align-items:flex-end}
.items-center{align-items:center}
.justify-start{justify-content:flex-start}
.justify-end{justify-content:flex-end}
.justify-center{justify-content:center}
.justify-between{justify-content:space-between}
.w-full{width:100%}
.max-w-md{max-width:28rem}
.max-w-4xl{max-width:56rem}
.flex-1{flex:1 1 0%}
.flex-shrink-0{flex-shrink:0}
.border{border-width:1px}
.border-t{border-top-width:1px}
.border-r{border-right-width:1px}
.border-b{border-bottom-width:1px}
.border-l{border-left-width:1px}
.border-gray-300{--tw-border-opacity:1;border-color:rgb(209 213 219/var(--tw-border-opacity))}
.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity))}
.bg-gray-50{--tw-bg-opacity:1;background-color:rgb(249 250 251/var(--tw-bg-opacity))}
.bg-indigo-600{--tw-bg-opacity:1;background-color:rgb(79 70 229/var(--tw-bg-opacity))}
.bg-blue-500{--tw-bg-opacity:1;background-color:rgb(59 130 246/var(--tw-bg-opacity))}
.bg-green-500{--tw-bg-opacity:1;background-color:rgb(34 197 94/var(--tw-bg-opacity))}
.bg-yellow-500{--tw-bg-opacity:1;background-color:rgb(234 179 8/var(--tw-bg-opacity))}
.bg-red-600{--tw-bg-opacity:1;background-color:rgb(220 38 38/var(--tw-bg-opacity))}
.bg-purple-500{--tw-bg-opacity:1;background-color:rgb(168 85 247/var(--tw-bg-opacity))}
.p-4{padding:1rem}
.p-6{padding:1.5rem}
.p-8{padding:2rem}
.px-3{padding-left:.75rem;padding-right:.75rem}
.px-4{padding-left:1rem;padding-right:1rem}
.py-12{padding-top:3rem;padding-bottom:3rem}
.py-2{padding-top:.5rem;padding-bottom:.5rem}
.pt-6{padding-top:1.5rem}
.pb-4{padding-bottom:1rem}
.pl-3{padding-left:.75rem}
.m-4{margin:1rem}
.mt-1{margin-top:.25rem}
.mt-2{margin-top:.5rem}
.mt-4{margin-top:1rem}
.mt-6{margin-top:1.5rem}
.mb-4{margin-bottom:1rem}
.mb-6{margin-bottom:1.5rem}
.ml-4{margin-left:1rem}
.mr-2{margin-right:.5rem}
.mx-auto{margin-left:auto;margin-right:auto}
.space-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem*var(--tw-space-y-reverse))}
.space-y-6>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1.5rem*var(--tw-space-y-reverse))}
.space-x-2>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(.5rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(.5rem*var(--tw-space-x-reverse))}
.text-xs{font-size:.75rem;line-height:1rem}
.text-sm{font-size:.875rem;line-height:1.25rem}
.text-base{font-size:1rem;line-height:1.5rem}
.text-lg{font-size:1.125rem;line-height:1.75rem}
.text-xl{font-size:1.25rem;line-height:1.75rem}
.text-2xl{font-size:1.5rem;line-height:2rem}
.text-3xl{font-size:1.875rem;line-height:2.25rem}
.font-medium{font-weight:500}
.font-semibold{font-weight:600}
.font-extrabold{font-weight:800}
.font-bold{font-weight:700}
.text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128/var(--tw-text-opacity))}
.text-gray-600{--tw-text-opacity:1;color:rgb(75 85 99/var(--tw-text-opacity))}
.text-gray-700{--tw-text-opacity:1;color:rgb(55 65 81/var(--tw-text-opacity))}
.text-gray-900{--tw-text-opacity:1;color:rgb(17 24 39/var(--tw-text-opacity))}
.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity))}
.text-indigo-600{--tw-text-opacity:1;color:rgb(79 70 229/var(--tw-text-opacity))}
.text-blue-600{--tw-text-opacity:1;color:rgb(37 99 235/var(--tw-text-opacity))}
.text-green-600{--tw-text-opacity:1;color:rgb(22 163 74/var(--tw-text-opacity))}
.text-yellow-600{--tw-text-opacity:1;color:rgb(202 138 4/var(--tw-text-opacity))}
.text-red-600{--tw-text-opacity:1;color:rgb(220 38 38/var(--tw-text-opacity))}
.text-purple-600{--tw-text-opacity:1;color:rgb(147 51 234/var(--tw-text-opacity))}
.underline{text-decoration-line:underline}
.opacity-50{opacity:.5}
.opacity-75{opacity:.75}
.shadow{--tw-shadow:0 1px 3px 0 rgb(0 0 0/.1),0 1px 2px -1px rgb(0 0 0/.1);--tw-shadow-colored:0 1px 3px 0 var(--tw-shadow-color),0 1px 2px -1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}
.shadow-md{--tw-shadow:0 4px 6px -1px rgb(0 0 0/.1),0 2px 4px -2px rgb(0 0 0/.1);--tw-shadow-colored:0 4px 6px -1px var(--tw-shadow-color),0 2px 4px -2px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}
.rounded{border-radius:.25rem}
.rounded-md{border-radius:.375rem}
.rounded-lg{border-radius:.5rem}
.rounded-full{border-radius:9999px}
.border-gray-300{--tw-border-opacity:1;border-color:rgb(209 213 219/var(--tw-border-opacity))}
.border-indigo-500{--tw-border-opacity:1;border-color:rgb(99 102 241/var(--tw-border-opacity))}
.hover\:bg-indigo-700:hover{--tw-bg-opacity:1;background-color:rgb(67 56 202/var(--tw-bg-opacity))}
.hover\:bg-blue-600:hover{--tw-bg-opacity:1;background-color:rgb(37 99 235/var(--tw-bg-opacity))}
.hover\:bg-gray-300:hover{--tw-bg-opacity:1;background-color:rgb(209 213 219/var(--tw-bg-opacity))}
.hover\:bg-yellow-600:hover{--tw-bg-opacity:1;background-color:rgb(202 138 4/var(--tw-bg-opacity))}
.hover\:bg-red-700:hover{--tw-bg-opacity:1;background-color:rgb(185 28 28/var(--tw-bg-opacity))}
.hover\:text-indigo-500:hover{--tw-text-opacity:1;color:rgb(99 102 241/var(--tw-text-opacity))}
.focus\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}
.focus\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}
.focus\:ring-indigo-500:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(99 102 241/var(--tw-ring-opacity))}
.focus\:ring-offset-2:focus{--tw-ring-offset-width:2px}
.focus\:border-indigo-500:focus{--tw-border-opacity:1;border-color:rgb(99 102 241/var(--tw-border-opacity))}
.transition-colors{transition-duration:.15s;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1)}
.transition-all{transition-duration:.15s;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1)}
.duration-200{transition-duration:.2s}
.ease-in{transition-timing-function:cubic-bezier(.4,0,1,1)}
@media (min-width:640px){.sm\:text-sm{font-size:.875rem;line-height:1.25rem}.sm\:px-6{padding-left:1.5rem;padding-right:1.5rem}}
@media (min-width:768px){.md\:text-base{font-size:1rem;line-height:1.5rem}}
@media (min-width:1024px){.lg\:px-8{padding-left:2rem;padding-right:2rem}}

/* Custom animations */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.fade-in{animation:fadeIn .3s ease-in}
.modal-backdrop{background:rgba(0,0,0,.5);backdrop-filter:blur(4px)}
.loading-spinner{border:3px solid #f3f3f3;border-top:3px solid #4f46e5;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite}
.btn-disabled{opacity:.5;cursor:not-allowed}
.search-input{transition:all .2s ease}
.search-input:focus{box-shadow:0 0 0 3px rgba(79,70,229,.1)}
.stock-adjust{transition:all .2s ease}
.stock-adjust:hover{transform:scale(1.05)}
    `;
    res.setHeader('Content-Type', 'text/css');
    res.send(fallbackCSS);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'StockFlow Railway server is running'
  });
});

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Mock authentication endpoints (Railway compatible)
app.post('/api/auth/signup', (req, res) => {
  const { orgName, email, password } = req.body;
  
  // Validate input
  if (!orgName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  // Mock user creation
  const mockUser = {
    id: Date.now(),
    email: email,
    name: email.split('@')[0],
    organization: {
      id: Date.now(),
      name: orgName
    }
  };
  
  // Mock JWT token
  const mockToken = 'railway-jwt-token-' + Date.now();
  
  res.json({
    token: mockToken,
    user: mockUser,
    message: 'Account created successfully!'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Mock login validation (accept any email/password for demo)
  const mockUser = {
    id: Date.now(),
    email: email,
    name: email.split('@')[0],
    organization: {
      id: Date.now(),
      name: 'Demo Organization'
    }
  };
  
  const mockToken = 'railway-jwt-token-' + Date.now();
  
  res.json({
    token: mockToken,
    user: mockUser,
    message: 'Login successful!'
  });
});

// Mock dashboard endpoint
app.get('/api/dashboard', (req, res) => {
  res.json({
    summary: {
      totalProducts: 12,
      lowStockItems: 3,
      totalQuantity: 245
    },
    lowStockProducts: [
      { id: 1, name: 'Product A', sku: 'SKU001', quantity: 3, threshold: 5 },
      { id: 2, name: 'Product B', sku: 'SKU002', quantity: 2, threshold: 10 },
      { id: 3, name: 'Product C', sku: 'SKU003', quantity: 4, threshold: 8 }
    ]
  });
});

// Mock products endpoint
app.get('/api/products', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Laptop',
      sku: 'LAP001',
      description: 'High-performance laptop',
      quantity_on_hand: 15,
      low_stock_threshold: 5,
      cost_price: 800,
      selling_price: 1200
    },
    {
      id: 2,
      name: 'Mouse',
      sku: 'MOU001',
      description: 'Wireless mouse',
      quantity_on_hand: 25,
      low_stock_threshold: 10,
      cost_price: 15,
      selling_price: 25
    },
    {
      id: 3,
      name: 'Keyboard',
      sku: 'KEY001',
      description: 'Mechanical keyboard',
      quantity_on_hand: 8,
      low_stock_threshold: 5,
      cost_price: 75,
      selling_price: 120
    }
  ]);
});

app.post('/api/products', (req, res) => {
  const { name, sku, description, quantityOnHand, lowStockThreshold, costPrice, sellingPrice } = req.body;
  
  if (!name || !sku) {
    return res.status(400).json({ error: 'Name and SKU are required' });
  }
  
  const newProduct = {
    id: Date.now(),
    name,
    sku,
    description: description || '',
    quantity_on_hand: quantityOnHand || 0,
    low_stock_threshold: lowStockThreshold || 5,
    cost_price: costPrice || 0,
    selling_price: sellingPrice || 0,
    created_at: new Date().toISOString()
  };
  
  res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { name, sku, description, quantityOnHand, lowStockThreshold, costPrice, sellingPrice } = req.body;
  
  if (!name || !sku) {
    return res.status(400).json({ error: 'Name and SKU are required' });
  }
  
  res.json({
    id: parseInt(req.params.id),
    name,
    sku,
    description: description || '',
    quantity_on_hand: quantityOnHand || 0,
    low_stock_threshold: lowStockThreshold || 5,
    cost_price: costPrice || 0,
    selling_price: sellingPrice || 0,
    updated_at: new Date().toISOString()
  });
});

app.delete('/api/products/:id', (req, res) => {
  res.json({ message: 'Product deleted successfully' });
});

// Mock settings endpoint
app.get('/api/settings', (req, res) => {
  res.json({
    lowStockThreshold: 5,
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    lowStockAlerts: true
  });
});

app.put('/api/settings', (req, res) => {
  const { lowStockThreshold, currency, timezone, emailNotifications, lowStockAlerts } = req.body;
  
  res.json({
    lowStockThreshold: lowStockThreshold || 5,
    currency: currency || 'USD',
    timezone: timezone || 'UTC',
    emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
    lowStockAlerts: lowStockAlerts !== undefined ? lowStockAlerts : true,
    updated_at: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'StockFlow Railway API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 StockFlow Railway Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: ${process.env.RAILWAY_PUBLIC_URL || `http://localhost:${PORT}`}`);
  console.log(`🔍 Health check: ${process.env.RAILWAY_PUBLIC_URL || `http://localhost:${PORT}`}/health`);
  console.log(`🎨 CSS endpoint: ${process.env.RAILWAY_PUBLIC_URL || `http://localhost:${PORT}`}/output.css`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down StockFlow Railway server...');
  process.exit(0);
});

module.exports = app;
