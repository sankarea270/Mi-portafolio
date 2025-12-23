// github-projects.js
// Fetches featured GitHub repos and renders project cards into #github-projects
(function(){
  'use strict';

  // CONFIG: change user and featured repos as needed
  var GITHUB_USER = 'sankarea270';
  var FEATURED_REPOS = ['Market','login'];

  var container = document.getElementById('github-projects');
  function el(tag, attrs, text){
    var e = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function(k){ e.setAttribute(k, attrs[k]); });
    if(text) e.textContent = text;
    return e;
  }

  function createCard(repo){
    var card = el('div', {class:'project-card'});

    var img = el('div', {class:'project-image'});
    // optional: set background color based on language
    img.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.06))';

    var info = el('div', {class:'project-info'});
    var status = el('div', {class:'project-status'}, repo.private ? 'Privado' : 'Public');
    var h3 = el('h3', null, repo.name);
    var p = el('p', null, repo.description || 'Sin descripción.');

    var tags = el('div', {class:'project-tags'});
    if(repo.language) tags.appendChild(el('div', {class:'tag'}, repo.language));
    tags.appendChild(el('div', {class:'tag'}, (repo.stargazers_count||0) + ' ★'));

    var links = el('div', {class:'project-links'});
    var repoA = el('a', {href: repo.html_url, target:'_blank', rel:'noopener noreferrer'}, 'Repositorio');
    links.appendChild(repoA);
    if(repo.homepage){
      var demo = el('a', {href: repo.homepage, target:'_blank', rel:'noopener noreferrer'}, 'Demo');
      links.appendChild(demo);
    }

    info.appendChild(status);
    info.appendChild(h3);
    info.appendChild(p);
    info.appendChild(tags);
    info.appendChild(links);

    card.appendChild(img);
    card.appendChild(info);
    return card;
  }

  function showMessage(msg, isError){
    if(!container) return;
    container.innerHTML = '';
    var m = el('div', {style:'grid-column:1/-1;padding:20px;text-align:center;color:' + (isError? '#ff9aa2':'#86efac')}, msg);
    container.appendChild(m);
  }

  function fetchRepo(name){
    var url = 'https://api.github.com/repos/' + encodeURIComponent(GITHUB_USER) + '/' + encodeURIComponent(name);
    return fetch(url).then(function(res){
      if(res.status === 404) throw new Error('Repositorio no encontrado: ' + name);
      if(res.status === 403) throw new Error('Rate limit de GitHub alcanzado o acceso denegado');
      return res.json();
    });
  }

  function init(){
    if(!container) return;
    if(!FEATURED_REPOS || FEATURED_REPOS.length === 0){
      showMessage('No hay repos configurados para mostrar. Actualiza github-projects.js');
      return;
    }
    showMessage('Cargando proyectos…');
    // Allow users to write repo names with any capitalization; fetch by lowercased name
    var promises = FEATURED_REPOS.map(function(r){
      var fetchName = (typeof r === 'string') ? r.toLowerCase() : r;
      return fetchRepo(fetchName).catch(function(err){ return {__error: err.message, name: r}; });
    });
    Promise.all(promises).then(function(results){
      container.innerHTML = '';
      results.forEach(function(repo){
        if(repo && repo.__error){
          var errCard = el('div', {class:'project-card'});
          var info = el('div', {class:'project-info'});
          info.appendChild(el('h3', null, repo.name));
          info.appendChild(el('p', null, 'Error: ' + repo.__error));
          errCard.appendChild(info);
          container.appendChild(errCard);
        } else {
          container.appendChild(createCard(repo));
        }
      });
    }).catch(function(err){
      showMessage('Error al cargar proyectos: ' + err.message, true);
    });
  }

  // Wait for fragments to be loaded so styles and layout exist
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
