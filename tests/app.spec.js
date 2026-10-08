import { test,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import files from '../src/files.json' with {type:'json'};
import {lessons,questions,fileUrl} from '../src/content.js';

test('accueil, lecture, exercice et progression persistante',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Bienvenue dans votre atelier'})).toBeVisible();
 await page.screenshot({path:'/tmp/simul8-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Commencer mon parcours',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Penser en processus',exact:true})).toBeVisible();
 await page.getByText('Point de vérification',{exact:false}).click();
 await expect(page.getByText('Vous devez distinguer le temps de traitement')).toBeVisible();
 await page.getByRole('button',{name:'Marquer comme terminée'}).click();
 await expect(page.getByRole('button',{name:'Leçon terminée',exact:true})).toBeDisabled();
 await page.reload();
 await expect(page.locator('.stats-row')).toContainText('1 / 14');
 await expect(page.locator('.stats-row')).toContainText('7 %');
 await page.getByRole('button',{name:'Mon parcours',exact:true}).click();
 await expect(page.locator('.module-row')).toHaveCount(7);
 expect(errors).toEqual([]);
});

test('quiz complet : validation, correction et score conservé',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Quiz & révisions',exact:true}).click();
 await page.getByRole('button',{name:'Commencer le quiz'}).click();
 for(let i=0;i<questions.length;i++){
  await expect(page.getByRole('button',{name:'Vérifier ma réponse'})).toBeDisabled();
  await page.locator('.quiz-option').nth(questions[i].answer).click();
  await page.getByRole('button',{name:'Vérifier ma réponse'}).click();
  await expect(page.getByText('Bien vu !',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:i===questions.length-1?'Voir mon résultat':'Question suivante'}).click();
 }
 await expect(page.locator('.quiz-complete')).toContainText('14 / 14');
 await page.reload();await page.getByRole('button',{name:'Quiz & révisions',exact:true}).click();
 await expect(page.getByText('Dernier résultat : 14 / 14')).toBeVisible();
 await page.getByLabel('Votre thème').selectOption('files');await page.getByRole('button',{name:'Commencer le quiz'}).click();
 await page.locator('.quiz-option').nth(0).click();await page.getByRole('button',{name:'Vérifier ma réponse'}).click();
 await expect(page.getByText('Une notion à retenir')).toBeVisible();
});

test('laboratoire : calcul, pause, comparaison et remise à zéro',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Laboratoire',exact:false}).first().click();
 await page.getByLabel('Distribution', {exact:false}).selectOption('fixed');
 await page.getByLabel('Horizon').selectOption('120');
 await page.getByRole('button',{name:'Pas à pas'}).click();
 await expect(page.locator('.simulation-clock')).toContainText('6 / 120');
 await page.getByRole('button',{name:'Reprendre',exact:true}).click();
 await expect(page.getByText('OBSERVATION TERMINÉE',{exact:true})).toBeVisible({timeout:15000});
 await expect(page.locator('.lab-conclusion')).toContainText('20 entrées = 19 sorties + 0 en attente + 1 en traitement');
 await expect(page.locator('.metric').first()).toContainText('0 min');
 await page.getByRole('button',{name:'Mémoriser comme référence'}).click();
 await page.getByLabel('Serveurs disponibles').fill('2');
 await page.getByRole('button',{name:'Lancer la simulation',exact:true}).click();
 await page.getByRole('button',{name:'Mettre en pause'}).click();
 await expect(page.getByText('EN PAUSE',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Reprendre',exact:true}).click();
 await expect(page.getByText('OBSERVATION TERMINÉE',{exact:true})).toBeVisible({timeout:15000});
 await expect(page.locator('.comparison')).toContainText('19');
 await page.screenshot({path:'/tmp/simul8-lab.png',fullPage:true});
 await page.getByRole('button',{name:'Réinitialiser la simulation'}).click();
 await expect(page.getByText('PRÊT À EXPÉRIMENTER')).toBeVisible();
});

test('bibliothèque : recherche, filtres, téléchargement et tous les fichiers servis',async({page,request})=>{
 await page.goto('/');await page.getByRole('button',{name:'Bibliothèque',exact:true}).click();
 await expect(page.locator('.file-row')).toHaveCount(100);
 await page.getByRole('textbox',{name:'Rechercher une ressource'}).fill('DOCTEUR');
 await expect(page.locator('.file-row')).toHaveCount(6);
 const downloadEvent=page.waitForEvent('download');
 await page.getByRole('link',{name:'Télécharger DOCTEUR.S8',exact:true}).click();
 const download=await downloadEvent;expect(download.suggestedFilename()).toBe('DOCTEUR.S8');
 await page.getByRole('textbox',{name:'Rechercher une ressource'}).fill('introuvable_xyz');
 await expect(page.getByText('Aucune ressource trouvée')).toBeVisible();
 await page.getByRole('button',{name:'Réinitialiser les filtres'}).click();
 await page.getByLabel('Filtrer par format').selectOption('PDF');
 await expect(page.locator('.file-row')).toHaveCount(2);
 for(const f of files){const r=await request.get(fileUrl(f.name));expect(r.ok(),f.name).toBeTruthy();expect((await r.body()).length,f.name).toBe(f.size);}
 for(const l of lessons) expect(files.some(f=>f.name===l.file)).toBeTruthy();
});

test('mobile : navigation, pages et absence de débordement',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByRole('button',{name:'Ouvrir le menu'})).toBeVisible();
 await page.screenshot({path:'/tmp/simul8-mobile.png',fullPage:true});
 const checkWidth=async()=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await checkWidth();
 for(const name of ['Mon parcours','Laboratoire','Quiz & révisions','Bibliothèque','Le petit lexique']){
  await page.getByRole('button',{name:'Ouvrir le menu'}).click();
  await page.locator('.sidebar').getByRole('button',{name:name==='Laboratoire'?'Laboratoire INTERACTIF':name,exact:true}).click();
  await checkWidth();
 }
 await page.getByLabel('Rechercher un terme').fill('FIFO');
 await expect(page.locator('.glossary-entry')).toHaveCount(1);
});

test('version compilée autonome : fonctionnement sans requêtes supplémentaires',async({page})=>{
 const errors=[];const external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 await page.route('**/standalone/index.html',route=>route.fulfill({contentType:'text/html',body:html}));
 await page.context().setOffline(true);
 await page.goto('/standalone/index.html');
 await expect(page.getByRole('heading',{name:'Bienvenue dans votre atelier'})).toBeVisible();
 await page.getByRole('button',{name:'Commencer mon parcours',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Penser en processus',exact:true})).toBeVisible();
 const url=await page.getByRole('link',{name:'Télécharger le modèle'}).evaluate(a=>a.href);
 expect(url).toBe('http://127.0.0.1:5173/standalone/cours/fastfood.S8');
 await page.locator('.sidebar nav').getByRole('button',{name:'Laboratoire INTERACTIF',exact:true}).click();
 await page.getByRole('button',{name:'Pas à pas'}).click();
 await expect(page.getByText('EN PAUSE',{exact:true})).toBeVisible();
 expect(external).toEqual(['http://127.0.0.1:5173/standalone/index.html']);expect(errors).toEqual([]);
});

test('version téléchargée depuis GitHub : HTML autonome et liens vers les cours',async({page})=>{
 const html=await readFile(new URL('../Ouvrir-SIMUL8.html',import.meta.url),'utf8');
 const errors=[];const requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>requests.push(r.url()));
 await page.route('**/Ouvrir-SIMUL8.html',route=>route.fulfill({contentType:'text/html',body:html}));
 await page.context().setOffline(true);
 await page.goto('/Ouvrir-SIMUL8.html');
 await expect(page.getByRole('heading',{name:'Bienvenue dans votre atelier'})).toBeVisible();
 await page.getByRole('button',{name:'Commencer mon parcours',exact:true}).click();
 const href=await page.getByRole('link',{name:'Télécharger le modèle'}).evaluate(a=>a.href);
 expect(href).toBe('http://127.0.0.1:5173/public/cours/fastfood.S8');
 for(const f of files){const bytes=await readFile(new URL('../public/cours/'+encodeURIComponent(f.name),import.meta.url));expect(bytes.length).toBe(f.size);}
 expect(requests).toEqual(['http://127.0.0.1:5173/Ouvrir-SIMUL8.html']);
 expect(errors).toEqual([]);
});
