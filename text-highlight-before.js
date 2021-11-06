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
    this.parts = this.text.split(/(\s+)/);
    this.wordNodes = [];
    this.lineBreaks = [];
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
    //this._renderParts();
    this._renderBlocks();
    //this._renderLayout();
  }

  _cleanup() {
    this.container.textContent = '';
    this.higlights = [];
    this.lineBreaks = [];
    this.wordNodes = [];
  }

  _renderParts() {
    for (let i = 0; i < this.parts.length; i++) {
      const partValue = this.parts[i];
      if (this._isWhiteSpaceStr(partValue)) {
        // add white space between words
        const spaceNode = document.createTextNode(partValue);
        this.container.appendChild(spaceNode);
      } else {
        // each word should be inside its own container
        const wordNode = document.createElement('span');
        wordNode.textContent = partValue;
        this.container.appendChild(wordNode);
        this.wordNodes.push(wordNode);
      }
    }
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
    
    let highlightText = "Today, I am sharing Microsoft’s 2021 Diversity and Inclusion report\n some new line";
  
    const blocks= [
      {
        textRange: [20, 46],
        textStyle: 'background: #efe; position: relative; line-height: 32px;',
        labels: [
          {
            labelStyle: 'background: #efe',
            labelText: 'Main article title',
          }
        ]
      },
      {
        textRange: [32, 36],
        textStyle: 'background: #faa',
        labels: [
          {
            labelStyle: 'background: #fdd',
            labelText: 'DATE',
          }
        ]
      }     
    ];

    // const blocks = this.blocks
    // let highlightText = this.text;

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
            _position: absolute;
            _top: 17px;
            _line-height: 1;

            content: "parent tag -";
            background-color:red;
          }</style> <span class='name' style="${block.textStyle}">`
         }

         //insert the (open/end) tag 
         highlightText = [highlightText.slice(0, offset), tag, highlightText.slice(offset)].join('');
         //highlightText =highlightText.substring(0, offset) +tag + highlightText.substring(offset)
         
    }


    // for (let i = 0; i < this.blocks.length; i++) {
    //   const [rangeStart, rangeEnd] = this.blocks[i].textRange;
    //   const matchingWordNodes = [];
    //   for (let j = 0, accLen = 0, wordIndex = 0; j < this.parts.length; j++) {
    //     if (accLen >= rangeStart && accLen <= rangeEnd) {
    //       matchingWordNodes.push(this.wordNodes[wordIndex]);
    //     }
    //     accLen += this.parts[j].length;

    //     if (!this._isWhiteSpaceStr(this.parts[j])) {
    //       wordIndex++;
    //     }
    //   }
    //   if (matchingWordNodes.length) {
    //     const highlight = this._renderBlock(this.blocks[i], matchingWordNodes);
    //     this.higlights.push(highlight);
    //   }
    // }

    const highlightTextNode = document.createElement('span');
    highlightTextNode.textContent = highlightText;
    //this.container.appendChild(highlightTextNode);
    this.container.insertAdjacentHTML( 'beforeend', highlightText);
  }

  _renderBlock(block, wordNodes) {
    const subContainer = document.createElement('span');
    subContainer.classList.add('text-higlight__match');
    subContainer.style.cssText = block.textStyle;
    this.container.insertBefore(subContainer, wordNodes[0]);

    for (let i = 0; i < wordNodes.length; i++) {
      const wordNode = wordNodes[i];
      const wordSpace = wordNode.nextSibling && wordNode.nextSibling.nodeType === Element.TEXT_NODE ? wordNode.nextSibling : null;
      subContainer.appendChild(wordNode);
      if (wordSpace && i !== wordNodes.length - 1) {
        subContainer.appendChild(wordSpace);
      }
    }
    this._renderLabels(subContainer, block.labels);

    return { container: subContainer, rows: block.labels ? block.labels.length : 0 };
  }

  _renderLabels(container, labels) {
    if (!labels || !labels.length) {
      return;
    }

    const labelList = document.createElement('ul');
    labelList.classList.add('text-higlight__label-list');
    for (let i = 0; i < labels.length; i++) {
      const labelItem = document.createElement('li');
      labelItem.classList.add('text-higlight__label');
      labelItem.textContent = labels[i].labelText;
      labelItem.style.cssText = labels[i].labelStyle;
      labelItem.title = labels[i].labelText;
      labelList.appendChild(labelItem);
    }
    container.appendChild(labelList);
  }

  _renderLayout() {
    let prevOffsetTop = null;
    let currentRow = 0;

    for (let i = 0; i < this.container.children.length; i++) {
      // calculate row index for current row
      const wordNode = this.container.children[i];
      const wordRect = wordNode.getBoundingClientRect();
      if (prevOffsetTop === null) {
        prevOffsetTop = wordRect.top;
      } else if (wordRect.top > prevOffsetTop) {
        prevOffsetTop = wordRect.top;
        currentRow++;

        // store references to containers which might include <br> nodes later
        const lineEndingNode = document.createElement('span');
        this.container.insertBefore(lineEndingNode, wordNode);
        this.lineBreaks.push(lineEndingNode);
      }
      wordNode.dataset.wordRowIndex = currentRow;
    }

    // calculate where additional line breaks needs to be added
    let lineBreakMap = new Map();
    for (let i = 0; i < this.higlights.length; i++) {
      const highlightRowIndex = parseInt(this.higlights[i].container.dataset.wordRowIndex);
      const highlightExtraRows = this.higlights[i].rows;
      const currentExtraBreaksCount = lineBreakMap.get(highlightRowIndex);

      if (typeof currentExtraBreaksCount !== 'number' || highlightExtraRows > currentExtraBreaksCount) {
        lineBreakMap.set(highlightRowIndex, highlightExtraRows);
      }
    }

    // add additional empty lines
    for (let [rowIndex, breakCount] of lineBreakMap.entries()) {
      this._setLineBreaks(rowIndex, breakCount);
    }
  }

  _setLineBreaks(rowIndex, lineBreaksCount) {
    const lineBreakContainer = this.lineBreaks[rowIndex];
    lineBreakContainer.textContent = '';
    for (let i = 0; i < lineBreaksCount + 1; i++) {
      lineBreakContainer.appendChild(document.createElement('br'));
    }
  }

  _isWhiteSpaceStr(str) {
    return /\s+/.test(str);
  }

}
