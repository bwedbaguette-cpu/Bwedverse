/* ==========================================================================
   BWEDTOWN MODAL & HABBO RESIDENCE UI
   Gestionnaire des fenêtres de dialogue style Pokémon DS & Habbo Hotel :
   - Panneau de bienvenue des résidences (Appartement privé / Visiter un ami)
   - Dialogues avec les PNJ de la ville
   - Lancement d'activités (Arcade BwedTris, Vestiaire d'avatars)
   ========================================================================== */

export class BwedTownModal {
  constructor() {
    this.container = null;
    this.isOpen = false;
    this.createDom();
  }

  createDom() {
    const existing = document.getElementById('bwedtownModalContainer');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.id = 'bwedtownModalContainer';
    wrap.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.25s ease;
    `;

    wrap.innerHTML = `
      <!-- Dialogue Box style Pokémon DS (en bas de l'écran) -->
      <div id="bwedDialogueBox" style="
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        width: min(92vw, 680px);
        background: rgba(25, 20, 16, 0.94);
        border: 3px solid #d4a373;
        box-shadow: 0 12px 36px rgba(0,0,0,0.6), inset 0 0 0 2px #4a2c11;
        border-radius: 14px;
        padding: 18px 24px;
        color: #fffaf0;
        font-family: 'Fredoka', 'Quicksand', system-ui, sans-serif;
        opacity: 0;
        pointer-events: none;
        transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
      ">
        <div id="bwedSpeakerName" style="
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #f3c270;
          font-weight: 700;
          margin-bottom: 6px;
        ">Interlocuteur</div>
        <div id="bwedDialogueText" style="
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 12px;
          color: #f7ede2;
        ">Message de dialogue...</div>
        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
          <span style="font-size: 11px; opacity: 0.65; color: #eed7be;">Appuyez sur [Espace] ou cliquez pour fermer</span>
          <button id="bwedDialogueCloseBtn" style="
            background: #d4a373;
            border: none;
            color: #2b1704;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 8px;
            cursor: pointer;
          ">Continuer ▶</button>
        </div>
      </div>

      <!-- Modal Habbo Résidence Privée (centré) -->
      <div id="bwedHabboCard" style="
        position: relative;
        width: min(90vw, 440px);
        background: linear-gradient(180deg, #2b1d14 0%, #1c120c 100%);
        border: 3px solid #f3c270;
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(243, 194, 112, 0.2);
        color: #fffaf0;
        font-family: 'Fredoka', 'Quicksand', system-ui, sans-serif;
        display: none;
        pointer-events: auto;
        transform: scale(0.92);
        transition: transform 0.2s ease;
      ">
        <div style="text-align: center; margin-bottom: 18px;">
          <div style="font-size: 32px; margin-bottom: 4px;">🥛🛋️</div>
          <h2 style="margin: 0; font-size: 22px; color: #fed7aa;">Résidence Milk Carton</h2>
          <p style="margin: 6px 0 0; font-size: 13px; color: #d4a373;">Appartements privés instanciés des joueurs (Habbo style)</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          <button id="habboMyRoomBtn" style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
          ">
            <span style="font-size: 20px;">🗝️</span>
            <div style="text-align: left;">
              <div>Entrer dans mon Appartement</div>
              <small style="font-weight: 400; opacity: 0.9; font-size: 11px;">Votre espace privé personnalisable</small>
            </div>
          </button>

          <button id="habboVisitFriendBtn" style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(243, 194, 112, 0.3);
            border-radius: 12px;
            color: #fef3c7;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
          ">
            <span style="font-size: 20px;">👥</span>
            <div style="text-align: left;">
              <div>Visiter un Joueur</div>
              <small style="font-weight: 400; opacity: 0.8; font-size: 11px;">Rejoindre la chambre d'un ami</small>
            </div>
          </button>
        </div>

        <div style="display: flex; justify-content: center;">
          <button id="habboCloseBtn" style="
            background: transparent;
            border: none;
            color: #a8a29e;
            font-size: 13px;
            cursor: pointer;
            padding: 6px 12px;
          ">Retourner dans BwedTown</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);
    this.container = wrap;

    // Événements boutons
    document.getElementById('bwedDialogueCloseBtn')?.addEventListener('click', () => this.hideDialogue());
    document.getElementById('habboCloseBtn')?.addEventListener('click', () => this.hideHabboCard());

    document.getElementById('habboMyRoomBtn')?.addEventListener('click', () => {
      this.hideHabboCard();
      this.showDialogue(
        'Concierge Bwed',
        'Votre appartement privé est en cours d aménagement ! Bientôt, vous pourrez y déposer vos meubles, y lancer de la musique et y faire la fête entre amis.'
      );
    });

    document.getElementById('habboVisitFriendBtn')?.addEventListener('click', () => {
      const pseudo = prompt('Entrez le pseudo de l ami à visiter :');
      if (pseudo) {
        this.hideHabboCard();
        this.showDialogue(
          'Interphone Bwed',
          `Sonnette envoyée chez ${pseudo}... La porte s ouvrira dès que son salon sera prêt !`
        );
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') && this.isOpen) {
        this.hideDialogue();
        this.hideHabboCard();
      }
    });
  }

  showDialogue(speaker, text) {
    const box = document.getElementById('bwedDialogueBox');
    const speakerEl = document.getElementById('bwedSpeakerName');
    const textEl = document.getElementById('bwedDialogueText');

    if (!box || !speakerEl || !textEl) return;

    speakerEl.textContent = speaker || 'BwedTown';
    textEl.textContent = text;

    box.style.opacity = '1';
    box.style.transform = 'translateX(-50%) translateY(0)';
    box.style.pointerEvents = 'auto';
    this.isOpen = true;
  }

  hideDialogue() {
    const box = document.getElementById('bwedDialogueBox');
    if (!box) return;

    box.style.opacity = '0';
    box.style.transform = 'translateX(-50%) translateY(20px)';
    box.style.pointerEvents = 'none';
    this.isOpen = false;
  }

  showHabboCard() {
    const card = document.getElementById('bwedHabboCard');
    if (!card) return;

    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
    this.container.style.pointerEvents = 'auto';
    card.style.display = 'block';
    setTimeout(() => {
      card.style.transform = 'scale(1)';
    }, 10);
    this.isOpen = true;
  }

  hideHabboCard() {
    const card = document.getElementById('bwedHabboCard');
    if (!card) return;

    card.style.transform = 'scale(0.92)';
    this.container.style.backgroundColor = 'transparent';
    this.container.style.pointerEvents = 'none';
    setTimeout(() => {
      card.style.display = 'none';
    }, 150);
    this.isOpen = false;
  }
}
