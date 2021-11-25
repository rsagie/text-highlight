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

  _createStartEndSortedBlocks(){
     let satrtEndSortedBlocks = []
     this.blocks.forEach(element => {
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
    let highlightText = this.text;
    const sortedBlocks = this._createStartEndSortedBlocks()

    //Start from the end of the text and go back, enable us to insert the labels without affecting the block offsets 
    for (let i = sortedBlocks.length-1; i >= 0; i--) {
         const block = sortedBlocks[i];
         let span_tag = ''
         if(block.type == 'end'){
            span_tag = "</span>"
         }
         else{
          let lableStyleEx = 'position: absolute; top: 17px; line-height: 1;' // an example of putting the lable in its new line
          let  blockStyleEx = 'line-height: 40px;'
          //lableStyleEx = ''
          //blockStyleEx = ''
          const randLableId= `${(Math.random())}`.replace('.','')
          const label = block.labels[0];
          span_tag = `<style>
          .label_${randLableId}::before {
            content: "${label.labelText} ";
            ${label.labelStyle};
            ${lableStyleEx};
            width: max-content; max-width: 100px; overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }</style> <span class='label_${randLableId}' style="position: relative; ${blockStyleEx}; ${block.textStyle}">`
         }

         //insert the (<span> or </span>) tag 
         highlightText =highlightText.substring(0, block.offset) +span_tag + highlightText.substring(block.offset)
         
    }
    const highlightTextNode = document.createElement('span');
    highlightTextNode.textContent = highlightText;
    this.container.insertAdjacentHTML( 'beforeend', highlightText);
  }

}
