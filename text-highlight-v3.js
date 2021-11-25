export default class TextHighlight {
  constructor(options) {
    this.options = {
      container: null,
      ...options
    };

    this.container = this.options.container;
    if (!this.container) {
      throw new Error('container not specified');
    }

    const { childNodes } = this.container;

    if (childNodes.length === 0) {
      throw new Error('container must contain plain text and could not be empty');
    }

    if (childNodes.length !== 1 || childNodes[0].nodeType !== Element.TEXT_NODE) {
      throw new Error('only plain text is allowed inside container');
    }

    this.container.classList.add('text-higlight');
    this.text = this.container.textContent;
    this.blocks = [];
    this.container.textContent = '';

  }

  highlight(blocks) {
    this.blocks = blocks || [];
    this.container.textContent = ''; //cleanup
    this._renderBlocks();
  }



  _renderBlocks() {
    let highlightText = this.text;

    let textArr = this.text.split('');
    //Start from the end of the text and go back, enable us to insert the labels without affecting the block offsets 
    for (let i = 0; i < this.blocks.length; i++) {
      let block = this.blocks[i]

      let start = block.textRange[0]
      let end = block.textRange[1]-1

      let span_tag_end = "</span>"

      let lableStyleEx = 'position: absolute; top: 17px; line-height: 1;' // an example of putting the lable in its new line
      let blockStyleEx = 'line-height: 40px;'

      const randLableId = `${(Math.random())}`.replace('.', '')
      const label = block.labels[0];
      let span_tag_start = `<style>
          .label_${randLableId}::before {
            content: "${label.labelText} ";
            ${label.labelStyle};
            ${lableStyleEx};
            width: max-content; max-width: 100px; overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }</style> <span class='label_${randLableId}' style="position: relative; ${blockStyleEx}; ${block.textStyle}">`

      textArr[start] = span_tag_start + textArr[start];
      textArr[end] = textArr[end] + span_tag_end;
    }

    this.container.insertAdjacentHTML('beforeend', textArr.join(''));
  }

}
