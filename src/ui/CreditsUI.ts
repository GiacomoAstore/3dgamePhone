/**
 * Modale dei Crediti di Brumavento (CreditsUI).
 * Visualizza autore (da config.json) e riconoscimenti formali per gli asset 3D CC0
 * effettivamente presenti nella build (Kenney, KayKit, Quaternius).
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.5.0
 */

import gameConfig from '../data/config.json';

export class CreditsUI {
  private container: HTMLElement;
  private card: HTMLElement;
  private isOpen = false;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'credits-modal';
    this.container.className = 'journal-overlay hidden';

    this.card = document.createElement('div');
    this.card.className = 'journal-card credits-card';

    this.buildHeader();
    this.buildContent();
    this.container.appendChild(this.card);
    document.body.appendChild(this.container);

    // Chiudi cliccando fuori dalla card
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });
  }

  private buildHeader(): void {
    const header = document.createElement('div');
    header.className = 'journal-header';

    const title = document.createElement('h2');
    title.textContent = '📜 Crediti di Brumavento';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.setAttribute('aria-label', 'Chiudi');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);
    this.card.appendChild(header);
  }

  private buildContent(): void {
    const content = document.createElement('div');
    content.className = 'journal-content';

    // 1. Autore del Gioco
    const authorSection = document.createElement('section');
    authorSection.className = 'journal-section';
    const authorTitle = document.createElement('h4');
    authorTitle.className = 'section-title';
    authorTitle.textContent = '🎮 Autore & Sviluppo';
    const authorDesc = document.createElement('p');
    authorDesc.className = 'help-tip';
    authorDesc.textContent = gameConfig.authorName && gameConfig.authorName.trim().length > 0
      ? `Autore: ${gameConfig.authorName}`
      : 'Progetto Brumavento - Esplorazione Cartoon 3D per Browser e Mobile';

    authorSection.appendChild(authorTitle);
    authorSection.appendChild(authorDesc);
    content.appendChild(authorSection);

    // 2. Modelli 3D e Texture (Solo asset presenti nella build)
    const assetsSection = document.createElement('section');
    assetsSection.className = 'journal-section';
    const assetsTitle = document.createElement('h4');
    assetsTitle.className = 'section-title';
    assetsTitle.textContent = '🎨 Modelli 3D & Grafica (Licenza CC0 dichiarata)';

    const list = document.createElement('ul');
    list.className = 'help-list';

    // Kenney
    const kenneyLi = document.createElement('li');
    kenneyLi.textContent = 'Kenney (Nature Kit & Pirate Kit) - Alberi, forziere, barili, cartello e fuoco da campo. Licenza: CC0 1.0 (da verificare dall\'utente). Consultato su https://kenney.nl in data 2026-11-11.';
    list.appendChild(kenneyLi);

    // KayKit
    const kaykitLi = document.createElement('li');
    kaykitLi.textContent = 'Kay Lousberg / KayKit (Adventurers & Animations) - Pip (Rogue Hooded), Nonna Bussola (Mage) e animazioni scheletriche. Licenza: CC0 1.0 (da verificare dall\'utente). Consultato su https://kaykit.nl in data 2026-11-11.';
    list.appendChild(kaykitLi);

    // Quaternius
    const quaterniusLi = document.createElement('li');
    quaterniusLi.textContent = 'Quaternius (Modular Ships & Modular Animals) - Barca a vela (BoatWSail.glb) e volpe animata (Fox.glb). Licenza: CC0 1.0 (da verificare dall\'utente). Consultato su https://quaternius.com in data 2026-11-11.';
    list.appendChild(quaterniusLi);

    assetsSection.appendChild(assetsTitle);
    assetsSection.appendChild(list);
    content.appendChild(assetsSection);

    // 3. Tecnologie e Motore
    const techSection = document.createElement('section');
    techSection.className = 'journal-section';
    const techTitle = document.createElement('h4');
    techTitle.className = 'section-title';
    techTitle.textContent = '⚙️ Tecnologie & Librerie';
    const techP = document.createElement('p');
    techP.className = 'help-tip';
    techP.textContent = 'Three.js 0.180.0, Vite 6.4.6, TypeScript 5.7.3, Three-Mesh-BVH, Web Audio API nativo per la sintesi procedurale dei suoni.';

    techSection.appendChild(techTitle);
    techSection.appendChild(techP);
    content.appendChild(techSection);

    this.card.appendChild(content);
  }

  public open(): void {
    this.isOpen = true;
    this.container.classList.remove('hidden');
  }

  public close(): void {
    this.isOpen = false;
    this.container.classList.add('hidden');
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }
}
