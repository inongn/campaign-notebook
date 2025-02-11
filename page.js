class EncounterBlock {
  static get toolbox() {
    return {
      title: 'Encounter',
      icon: '⚔️',
    };
  }

  constructor({ data, api, config }) {
    this.api = api;
    this.data = data;
    this.wrapper = undefined;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('encounter');
    
    this.wrapper.innerHTML = `
      <div class="chip-container" id="chip-container">
          <div class="chip" data-monster="">
            <span></span>
            <button class="remove-btn" data-monster="">×</button>
          </div>
        <input type="text" id="monster-input" class="monster-input" placeholder="Enter monster..." autocomplete="off">
        <div id="autocomplete-list" class="autocomplete-list"></div>
      </div>
      <div id="monster-actions" class="monster-actions hidden">
        <button class="clone-monster">Clone</button>
        <button class="roll-initiative">Roll Initiative</button>
      </div>
      <div class="monster-content"></div>
      <div id="custom-monster-editor" class="custom-monster-editor hidden">
        <textarea class="custom-monster-textarea"></textarea>
        <button class="save-monster">Save</button>
      </div>
    `;
    
    this.initializeEncounters();
    return this.wrapper;
  }
    initializeEncounters(){
        new Encounter(this.wrapper, this.data.chips);
}

save() {
    const chips = Array.from(this.wrapper.querySelectorAll('.chip')).map(chip => chip.dataset.monster);
    return { chips };
  }
}
