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
    this.higlights = [];
    this.blocks = [];
    this._render();

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize() {
    this._render();
  }

  highlight(blocks) {
    this.blocks = blocks || [];
    this._render();
  }

  _render() {
    this._cleanup();
    this._renderBlocks();
  }

  _cleanup() {
    this.container.textContent = '';
    this.higlights = [];
  }


  _createSatrtEndSortedBlocks(blocks){
     let satrtEndSortedBlocks = []
     blocks.forEach(element => {
      const [rangeStart, rangeEnd] = element.textRange;
      element.type = 'start'
      element.offset = rangeStart
      satrtEndSortedBlocks.push(element)
      
      // create 'new' element, for the 'end' offset
      const endElement = JSON.parse(JSON.stringify(element));
      endElement.type = 'end'
      endElement.offset = rangeEnd
      satrtEndSortedBlocks.push(endElement)
     });

     satrtEndSortedBlocks.sort(function(a, b) {
      var keyA = new Date(a.offset),
        keyB = new Date(b.offset);
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    })

    return satrtEndSortedBlocks;
  }

  _renderBlocks() {
    
    const blocks = this.blocks
    let highlightText = this.text;

    const sortedBlocks = this._createSatrtEndSortedBlocks(blocks)
    //const highlightText = this.text;
    for (let i = sortedBlocks.length-1; i >= 0; i--) {
         const block = sortedBlocks[i];
         let tag = ''
         let offset = 0;
         if(block.type == 'end'){
            tag = "</span>"
            offset = block.offset 
         }
         else{
          offset = block.offset;
          tag = `<style>
          .name::before {
            width: max-content;
            position: absolute;
            top: 17px;
            line-height: 1;

            content: "parent tag -";
            background-color:red;
          }</style> <span class='name' style="position: relative; line-height: 40px; ${block.textStyle}">`
         }

         //insert the (open/end) tag 
         highlightText = [highlightText.slice(0, offset), tag, highlightText.slice(offset)].join('');
         //highlightText =highlightText.substring(0, offset) +tag + highlightText.substring(offset)
         
    }
    const highlightTextNode = document.createElement('span');
    highlightTextNode.textContent = highlightText;
    //this.container.appendChild(highlightTextNode);
    this.container.insertAdjacentHTML( 'beforeend', highlightText);
  }

}
