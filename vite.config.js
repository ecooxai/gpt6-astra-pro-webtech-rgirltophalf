import {defineConfig} from 'vite';
export default defineConfig({
 base:'./',
 server:{host:'0.0.0.0',port:48763,strictPort:true,allowedHosts:true,watch:{ignored:['**/public/process/**','**/public/latest/**','**/.logs/**','**/.pages/**','**/build/**','**/reference/**']}},
 build:{outDir:'build',emptyOutDir:true,chunkSizeWarningLimit:900}
});
