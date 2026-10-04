import { defineConfig } from 'vite';
export default defineConfig({base:'./',server:{host:'0.0.0.0',port:48763,strictPort:true,allowedHosts:true},build:{outDir:'build',chunkSizeWarningLimit:900}});
