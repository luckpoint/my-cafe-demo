import './index.css'
import { initHeader } from './components/Header.js'
import { initFooter } from './components/Footer.js'

initHeader();
initFooter();

const app = document.querySelector('#app');
if (app && window.location.pathname === '/' || window.location.pathname === '/index.html') {
    // Only verify app logical existence, content will be injected by page scripts
}

