


function NoteEditor(options) {
    return this.init(options);
}


(function (window, document) {
		

	NoteEditor.prototype = {
	    
	
	    init: function (options) {
			var self = this;
			this.options = options || {}
			this.options.displayTextField  = options.displayTextField || false;
			
			
			this.options = {
				textFieldName: 'text',
				jsonFieldName: 'json',
				htmlFieldName: 'html',
				tagFieldName: 'tags'
			};
			
	
			var self = this;
			
			this.html = '';
			this.text = '';
			this.tags = [];
			
			this.container = document.querySelector('.note-editor');
			this.contentContainer = document.querySelector('#note-editor-ui');
			this.textContainer = document.querySelector('[name="' + this.options.textFieldName + '"]');
			this.htmlContainer = document.querySelector('[name="' + this.options.htmlFieldName + '"]');
			this.jsonContainer = document.querySelector('[name="' + this.options.jsonFieldName + '"]');
			this.tagContainer = document.querySelector('[name="' + this.options.tagFieldName + '"]');	
			
			this.addDOMElt();
			
	
		    this.onTextChange = new Event('text-change');
		    this.charCount = 0;
		    
	
		    // basic json for post
			this.json = {
			    "items": [
			        {
			            "type": [
			                "h-entry",
			                "h-as-note"
			            ],
			            "properties": {
			                "content": [{
			                        "value": "",
			                        "html": ""
			                    }],
			                "published": []
			            }
			        }
			    ],
			    "rels": {}
			};
	
	
			// text update 
		    this.contentContainer.addEventListener('input', function (e) {
		    	setTimeout(function () {
		      		self.updateText();
		       	}, 50);
		    });
	
		    // text change - waits for interaction to take place
		    this.contentContainer.addEventListener('paste', function (e) {
		      setTimeout(function () {
		         self.updateText();
		      }, 50);
		    });
	
		    this.contentContainer.addEventListener('cut', function (e) {
		      setTimeout(function () {
		          self.updateText();
		      }, 50);
		    });
			
			this.contentContainer.addEventListener('change', function (e) {
		      setTimeout(function () {
		          self.updateText();
		      }, 50);
		    });
			
			this.contentContainer.addEventListener('DOMNodeInserted', function (e) {
		      setTimeout(function () {
		          self.updateText();
		      }, 50);
		    });
			

	
			document.addEventListener('text-change', function (e) {
				self.updateText();
				self.contentContainer.dispatchEvent(self.onTextChange);
		    });

	
		    self.updateText();
		    self.setCaretAt(this.contentContainer);
			
			
			editor.init();
			// hack to fix tailing spaces
	        this.contentContainer.addEventListener('input', function( event  ){
	          setTimeout( function() {
	           // self.htmlContainer.value = this.contentContainer.innerHTML.trim();
	
	          }, 50);
	        }, false);
		
		    
	
	/*
			// add in reply to add username event
			var i = this.inReplyTos.length;
			while (i--) {
				this.inReplyTos[i].addEventListener('input', function (e) {
					var target = e.currentTarget;
					self.appendMentionUser( target.value );
				});
				if(this.inReplyTos[i].value !== ''){
					self.appendMentionUser( this.inReplyTos[i].value );
				}
			}
	
	*/
	
		},
		
		
		addDOMElt: function(  ){
			
			if(this.container){	
			
				this.contentContainer = document.createElement('div');
				this.contentContainer.id = 'note-editor-ui';
				this.contentContainer.className = 'note-editor-ui';
				this.contentContainer.contentEditable = true;
				this.contentContainer.placeholder = 'Add your text';
				this.container.appendChild(this.contentContainer);
				
				this.cElt = document.createElement('div'); 
				this.cElt.className = 'note-editor-count';
				this.cElt.innerHTML = '0';
				this.container.appendChild(this.cElt);
				
				
				if(this.textContainer && this.options.displayTextField === true){
					this.textContainer.style.display = 'none';
				}
			}
			
			
			//  <div class="note-editor-count">0</div>
         // <article id="note-editor-ui" class="note-editor-ui" contenteditable="true" placeholder="Add your text"></article>

		},
	
	
		updateCount: function ( count ){
			var node = document.querySelector('.note-editor-count');
		
			if(node && count !== undefined){
		
				var displayLimit = 0,
					warnLimit = 140;
		
				// show
				if(count > displayLimit){
					//node.style.display = 'block';
				}else{
					//node.style.display = 'none';
				}
		
				//color
				if( count > warnLimit ){
					node.className = 'note-editor-count note-editor-over';
				}else{
					node.className = 'note-editor-count';
				}
				node.innerHTML = count;
		
			}
		},
	
	
		// Set cursor position at the end of a node
		setCaretAt: function ( node ){
			var range = document.createRange();
			var selection = window.getSelection();
			if(node){
				range.setStart(node, 0);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		},
	
	
		// update form input element with plain text and html
		updateText: function(){
		    if( this.textContainer.value !== this.contentContainer.textContent ){
	
			    this.textContainer.value = this.contentContainer.textContent.trim();
			    this.text = this.textContainer.value;
			    this.htmlContainer.value = this.simplifyHtml( this.contentContainer.innerHTML.trim() );
			    this.charCount = this.textContainer.value.length;
				this.updateCount( this.charCount );
				
				this.processor();
				
			    // fire event for external modules
			    this.contentContainer.dispatchEvent(this.onTextChange);
				this.updateCount( this.charCount );
	
		    }
		},
		
		
		// remove single wrapping p tags to simplify html
		simplifyHtml: function( htmlStr ){
			if(htmlStr && htmlStr !== ''){
				var pArr = htmlStr.match(/<p>/g); 
				if(this.startsWith(htmlStr, '<p>') && pArr.length === 1){
					htmlStr = htmlStr.replace('<p>','').replace('</p>','')
				}	
			}
			return htmlStr;
		},
	
	
		trim: function (str) {
		    return str.replace(/^\s+|\s+$/g, "");
		},
	
		startsWith: function(str, test) {
			return str.indexOf(test) === 0;
		},
	
		endsWith: function(str, test) {
			return str.indexOf(test, this.length - test.length) !== -1;
		},
	
	
		// get raw data and updates the content form elements with JSON to submit 
		processor: function(){
			var props = this.json.items[0].properties;
	
			// get content
			this.html = this.htmlContainer.value;
			this.text = this.textContainer.value;
			
	
			// clean content
			this.text = this.text.replace(/\u00A0/g, ' '); // remove nonbreakingspace char
			if($ && $.htmlClean){
				var options = {
					allowedTags: ['p', 'a', 'b', 'i', 'strong', 'em', 'blockquote'],
					allowedAttributes: [['class'], []],
					allowedClasses: ['auto-link', 'h-x-username', 'hashtag', 'u-photo'],
					format: false
				}
				this.html = $.htmlClean(this.html, options);	
			}
			
			this.html = this.html.replace( '<caret>-</caret>', '' );
			this.html = this.html.replace( /&nbsp;/g, ' ' );
			this.html = this.html.replace(/\u00A0/g, ' '); // remove nonbreakingspace char
			this.html = this.trim(this.html);
	
			// add content
			props.content[0].html = this.html;
			props.content[0].value = this.trim(this.text);
	
	
			this.tags = this.getHashTags( this.text );
			if(this.tags.length > 0){
				props['category'] = this.tags;
			}
	
			// add date
			props.published[0] = new Date().toISOString();
			
			this.htmlContainer.value = this.html;
			this.jsonContainer.value = JSON.stringify( this.json );
			this.textContainer.value = this.text;
			if(this.getHashTags(this.text).length > 0 ){
				this.tagContainer.value = JSON.stringify( this.getHashTags(this.text).join(', ') );
			}else{
				this.tagContainer.value = '';
			}
			
			
	
		},
	
	
	
		// return a list of tags parsed from text
		getHashTags: function ( text ){
			var tags = [],
				words = text.split(' '),
				x = 0,
				i = words.length;
				
			while (x < i) {
				var word = words[x];
				if(word.indexOf('#') === 0){
					var item = word.replace(/#/g,'').toLowerCase();
					if(this.endsWith(item, '-' )){
						item = item.substr(0,item.lenght-1);
					}
					if(item !== ''){
						tags.push( item );
					}
				}
				x++;
			}
			return tags;
		},
	
	
	
	
		// if passed url is twitter profile at @username into the edit area
		appendMentionUser: function( url ){ 
	        if(url.indexOf('//twitter.com/')  > -1 && url.indexOf('/status/')  > -1){
	          	url = url.replace('https://twitter.com/','').replace('http://twitter.com/','');
	
	          	var username = url.split('/')[0],
	          		link = document.createElement('a');
	
	          	link.href="https://twitter.com/" + username;
	          	link.appendChild(document.createTextNode('@' + username)); 
	
				var parentElement = document.querySelector('#content');
				if(parentElement.firstChild){
					parentElement.insertBefore(link, parentElement.firstChild);
				}else{
					parentElement.appendChild(link);
				}
				
		
				var text = document.createTextNode(' ')
				this.insertAfter(text , link);
	
				this.setCaretAt(text);
				document.querySelector('#content').focus();
	
	          	this.updateText();
	        }
	    },
	
	
		insertAfter: function(newNode, referenceNode) {
		    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}
	
	
	 }



}(window, document));

















// Based on zenpen editor 2014-07-10 
// added autolinking and hmtl clean paste
// copyright 2014 glennjones 
// https://github.com/tholman/zenpen/blob/master/licence.md

// version 0.0.1
var lastSelection;

var editor = (function() {

	// Editor elements
	var headerField, contentField, cleanSlate, lastType, currentNodeList, savedSelection;

	// Editor Bubble elements
	var textOptions, optionsBox, boldButton, italicButton, urlButton, urlInput;  //quoteButton

	var composing;
	var onTextChange = new Event('text-change');


	function init() {
		composing = false;
		bindElements();
		createEventBindings();
	}


	function createEventBindings() {

		document.addEventListener('paste', function( event ){
			cleanPaste( event )
		}, false);

		document.addEventListener('input', function( event  ){
			checkAutoLink( event );
			setTimeout( function() {
				mergeLinktoText( event );
			}, 50);
		}, false);

		// Key up bindings
		document.onkeyup = checkTextHighlighting;

		// Mouse bindings
		document.onmousedown = checkTextHighlighting;
		document.onmouseup = function( event ) {
			setTimeout( function() {
				checkTextHighlighting( event );
			}, 1);
		};
		
		// Window bindings
		window.addEventListener( 'resize', function( event ) {
			updateBubblePosition();
		});

		document.body.addEventListener( 'scroll', function() {
			// TODO: Debounce update bubble position to stop excessive redraws
			updateBubblePosition();
		});

		// Composition bindings. We need them to distinguish
		// IME composition from text selection
		document.addEventListener( 'compositionstart', onCompositionStart );
		document.addEventListener( 'compositionend', onCompositionEnd );
	}


	function bindElements() {

		headerField = document.querySelector( '.header' );
		contentField = document.querySelector( '.note-editor-ui' );
		textOptions = document.querySelector( '.text-options' );

		optionsBox = textOptions.querySelector( '.options' );

		boldButton = textOptions.querySelector( '.bold' );
		boldButton.onclick = onBoldClick;

		italicButton = textOptions.querySelector( '.italic' );
		italicButton.onclick = onItalicClick;

	/*	quoteButton = textOptions.querySelector( '.quote' );
		quoteButton.onclick = onQuoteClick;*/

		urlButton = textOptions.querySelector( '.url' );
		urlButton.onmousedown = onUrlClick;

		urlInput = textOptions.querySelector( '.url-input' );
		urlInput.onblur = onUrlInputBlur;
		urlInput.onkeydown = onUrlInputKeyDown;
	}

	function checkTextHighlighting( event ) {

		var selection = window.getSelection();

		// removed || event.target.parentNode.classList.contains( "ui-inputs" ) 
		if ( (event.target.className === "url-input" ||
		    event.target.classList.contains( "url" )  ) ) {

			currentNodeList = findNodes( selection.focusNode );
			updateBubbleStates();
			return;
		}

		// Check selections exist
		if ( selection.isCollapsed === true && lastType === false ) {

			onSelectorBlur();
		}

		// Text is selected
		if ( selection.isCollapsed === false && composing === false ) {

			currentNodeList = findNodes( selection.focusNode );

			// Find if highlighting is in the editable area
			//if ( hasNode( currentNodeList, "ARTICLE") ) {
				updateBubbleStates();
				updateBubblePosition();

				// Show the ui bubble
				textOptions.className = "text-options active";

			//}
		}

		lastType = selection.isCollapsed;
	}
	
	function updateBubblePosition() {
		var selection = window.getSelection();
		var range = selection.getRangeAt(0);
		var boundary = range.getBoundingClientRect();
		
		textOptions.style.top = boundary.top - 5 + window.pageYOffset + "px";
		textOptions.style.left = (boundary.left + boundary.right)/2 + "px";
	}

	function updateBubbleStates() {

		// It would be possible to use classList here, but I feel that the
		// browser support isn't quite there, and this functionality doesn't
		// warrent a shim.

		if ( hasNode( currentNodeList, 'B') ) {
			boldButton.className = "bold active"
		} else {
			boldButton.className = "bold"
		}

		if ( hasNode( currentNodeList, 'I') ) {
			italicButton.className = "italic active"
		} else {
			italicButton.className = "italic"
		}

	/*	if ( hasNode( currentNodeList, 'BLOCKQUOTE') ) {
			quoteButton.className = "quote active"
		} else {
			quoteButton.className = "quote"
		}*/

		if ( hasNode( currentNodeList, 'A') ) {
			urlButton.className = "url useicons active"
		} else {
			urlButton.className = "url useicons"
		}
	}

	function onSelectorBlur() {

		textOptions.className = "text-options fade";
		setTimeout( function() {

			if (textOptions.className == "text-options fade") {
				textOptions.className = "text-options";
				textOptions.style.top = '-999px';
				textOptions.style.left = '-999px';
			}
		}, 260 )
		
	}

	function findNodes( element ) {

		var nodeNames = {};

		// Internal node?
		var selection = window.getSelection();

		// if( selection.containsNode( document.querySelector('b'), false ) ) {
		// 	nodeNames[ 'B' ] = true;
		// }

		while ( element.parentNode ) {

			nodeNames[element.nodeName] = true;
			element = element.parentNode;

			if ( element.nodeName === 'A' ) {
				nodeNames.url = element.href;
			}
		}

		return nodeNames;
	}

	function hasNode( nodeList, name ) {

		return !!nodeList[ name ];
	}

	function saveState( event ) {
		
		localStorage[ 'header' ] = headerField.innerHTML;
		localStorage[ 'content' ] = contentField.innerHTML;
	}

	function loadState() {

		if ( localStorage[ 'header' ] ) {
			headerField.innerHTML = localStorage[ 'header' ];
		}

		if ( localStorage[ 'content' ] ) {
			contentField.innerHTML = localStorage[ 'content' ];
		}
	}

	function onBoldClick() {
		document.execCommand( 'bold', false );
	}

	function onItalicClick() {
		document.execCommand( 'italic', false );
	}

	function onQuoteClick() {

		var nodeNames = findNodes( window.getSelection().focusNode );

		if ( hasNode( nodeNames, 'BLOCKQUOTE' ) ) {
			document.execCommand( 'formatBlock', false, 'p' );
			document.execCommand( 'outdent' );
		} else {
			document.execCommand( 'formatBlock', false, 'blockquote' );
		}
	}

	function onUrlClick() {

		if ( optionsBox.className == 'options' ) {

			optionsBox.className = 'options url-mode';

			// Set timeout here to debounce the focus action
			setTimeout( function() {

				var nodeNames = findNodes( window.getSelection().focusNode );

				if ( hasNode( nodeNames , "A" ) ) {
					urlInput.value = nodeNames.url;
				} else {
					// Symbolize text turning into a link, which is temporary, and will never be seen.
					document.execCommand( 'createLink', false, '/' );
				}

				// Since typing in the input box kills the highlighted text we need
				// to save this selection, to add the url link if it is provided.
				lastSelection = window.getSelection().getRangeAt(0);
				lastType = false;

				urlInput.focus();

			}, 100);

		} else {

			optionsBox.className = 'options';
		}
	}

	function onUrlInputKeyDown( event ) {

		if ( event.keyCode === 13 ) {
			event.preventDefault();
			applyURL( urlInput.value );
			urlInput.blur();
		}
	}

	function onUrlInputBlur( event ) {

		optionsBox.className = 'options';
		applyURL( urlInput.value );
		urlInput.value = '';

		currentNodeList = findNodes( window.getSelection().focusNode );
		updateBubbleStates();
	}

	function applyURL( url ) {

		rehighlightLastSelection();

		// Unlink any current links
		document.execCommand( 'unlink', false );

		if (url !== "") {
		
			// Insert HTTP if it doesn't exist.
			if ( !url.match("^(http|https)://") ) {

				url = "http://" + url;	
			} 

			document.execCommand( 'createLink', false, url );
		}
	}

	function rehighlightLastSelection() {

		window.getSelection().addRange( lastSelection );
	}

	function getWordCount() {
		
		var text = get_text( contentField );

		if ( text === "" ) {
			return 0
		} else {
			return text.split(/\s+/).length;
		}
	}

	function onCompositionStart ( event ) {
		composing = true;
	}

	function onCompositionEnd (event) {
		composing = false;
	}


    var KEYS = {
        SPACE: 32,
        TAB: 9,
        ENTER: 13
    };

    function startWith(str, test){
    	return (str.indexOf(test) === 0);
    }

    function endWith(str, test) {
    	return str.indexOf(test, str.length - test.length) !== -1;
	};


    function findChildINdex(node){
	    var i=1;
	    while(node.previousSibling){
	        node = node.previousSibling;
	        if(node.nodeType === 1){
	            i++;
	        }
	    }
	    return i; //Returns 3
	}

	function insertAfter(referenceNode, newNode) {
    	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}


	var autoLinks = [{
			'token': '@',
			'removeToken': true,
			'class': 'auto-link h-x-username',
			'urlTemplate': 'https://twitter.com/{value}'
		},{
			'token': '#',
			'class': 'auto-link hashtag',
			'removeToken': true,
			'urlTemplate': 'https://twitter.com/search?q=%23{value}&src=hash'
		},{
			'token': 'http',
			'class': 'auto-link',
			'removeToken': false,
			'urlTemplate': '{value}'
		}
	]



	// checks for token that starts a autolink
	function checkAutoLink( event ){

        var addedLink = false,
        	text,
        	items = [],
        	lastWord = '',
        	selection = window.getSelection(),
            range = selection.getRangeAt(0),
            caretNode = document.createElement('caret'),
            parentOfCaretNode;
        

       	caretNode.appendChild(document.createTextNode('-'));
		range.insertNode(caretNode);
		parentOfCaretNode = caretNode.parentNode;

		if(caretNode.previousSibling && caretNode.previousSibling.textContent){

			text = caretNode.previousSibling.textContent; // text of node been edited

	        if(text !== '' && hasAncestorWithNodeType( caretNode, 'A' ) === false){
	        	if(text.indexOf(' ') > -1 ){
	        		items = text.split(' ')
	        		lastWord = items[items.length-1]
	        	}else{
	        		lastWord = text;
	        	}

	        	if(lastWord && lastWord !== ' '){
		        	var i = autoLinks.length;
					while (i--) {
					   	var autoLink = autoLinks[i]


						if(startWith(lastWord, autoLink.token) 
							|| endWith(lastWord.trim(), autoLink.token) 
							|| endWith(lastWord, '&nbsp;' + autoLink.token)){



		        			var aNode = document.createElement('a');
		        			aNode.appendChild(document.createTextNode(''));
		        			if(lastWord.trim() !== lastWord){
		        				var blankText = document.createTextNode(' ');
		        				insertAfter(caretNode, blankText);
		        				insertAfter(blankText, aNode);
		        			}else{
		        				insertAfter(caretNode, aNode)
		        			}
		       

		        			// remove token from previous text
		        			caretNode.previousSibling.textContent = caretNode.previousSibling.textContent.replace( lastWord, '');

		        			// add text and attribute to a tag
		            		aNode.textContent = lastWord.trim();
		            		aNode.href = autoLink.urlTemplate.replace('{value}','');
		            		aNode.setAttribute('class', autoLink.class);
		            /*		aNode.setAttribute('autocorrect', 'off');
		            		aNode.setAttribute('autocomplete', 'off');
		            		aNode.setAttribute('spellcheck', 'false');*/


		            		// refocus range selction on inserted node
			                range.setStart(range.startContainer, range.startOffset); 
			                range.setStartAfter(aNode);
			                range.setEndAfter(aNode);
			                selection.removeAllRanges();
			                selection.addRange(range);

			                document.dispatchEvent(onTextChange);
		        		}
					}
				}
	        }
		}

    	parentOfCaretNode.removeChild(caretNode);
        parentOfCaretNode.normalize(); //merge adjacent text nodes

	}



	// takes plain text and creates HTML with autolinks
	function autoLink( text ){

		var words = text.split(' '),
			i = words.length;

		while (i--) {
			var word = trim( words[i] );
			if(word.indexOf('http') === 0 || word.indexOf('https') === 0){
				words[i] = '<a  class="auto-link" data-shorten="' + word + '" href="' + word + '">' + word + '</a>';
			}
			if(word.indexOf('@') === 0){
				words[i] = '<a class="auto-link h-x-username" href="https://twitter.com/' + encodeURIComponent(word.replace('@','')) + '">' + word + '</a>';
			}
			if(word.indexOf('#') === 0){
				//this.tags.push( word.replace(/#/g,'').toLowerCase() );
				words[i] = '<a class="auto-link hashtag" href="https://twitter.com/search?q=' + encodeURIComponent(word) + '&amp;src=hash">' + word + '</a>';
			}
			if (word.indexOf('pic.twitter.com/') === 0) {
				words[i] = '<a class="auto-link u-photo" href="' + word + '">' + word + '</a>';
			}
		}
		return words.join(' ');

	}





	function trim (str) {
	    return str.replace(/^\s+|\s+$/g, "");
	}

	// adds merging of text blocks into a tag to left if there is not space
    function mergeLinktoText( event ){

		var addedLink = false,
        	text,
        	selection = window.getSelection(),
            range = selection.getRangeAt(0),
            caretNode = document.createElement('caret'),
            parentOfCaretNode;
           
       	caretNode.appendChild(document.createTextNode('-'));
		range.insertNode(caretNode);
		parentOfCaretNode = caretNode.parentNode;

		if(caretNode.previousSibling 
			&& caretNode.previousSibling.previousSibling){

			var previousElt = caretNode.previousSibling.previousSibling;

			console.log('tag:' + previousElt.tagName)
			console.log('node type:' + caretNode.previousSibling.nodeType);
			console.log('node tagName:' + caretNode.previousSibling.tagName);
			console.log('node textContent:' + caretNode.previousSibling.textContent);
			console.log('text:' + caretNode.previousSibling.textContent);
			console.log('----------------:')

			if( previousElt.tagName 
				&& previousElt.tagName === 'A' 
				&& caretNode.previousSibling 
				&& caretNode.previousSibling.textContent ){

				text = caretNode.previousSibling.textContent;
				
				if((text.trim() !== '' && text.length === 1) && text !== '&nbsp;'){


					// move text into link
					previousElt.textContent = previousElt.textContent + text;

					var i = autoLinks.length;
					while (i--) {
					   	var autoLink = autoLinks[i]
					   	if( startWith(previousElt.textContent, autoLink.token) ){
					   		var valueText = (autoLink.removeToken === true)? previousElt.textContent.replace(autoLink.token,'') : previousElt.textContent
					   		previousElt.href = autoLink.urlTemplate.replace('{value}', valueText);
					   		break;
					   	}
					}

					// remove letter from text node
					caretNode.previousSibling.textContent = '';

					range.setStart(range.startContainer, range.startOffset); 
		            range.setStartAfter(caretNode.previousSibling);
		            range.setEndAfter(caretNode.previousSibling);

		            selection.removeAllRanges();
		            selection.addRange(range);
		            document.dispatchEvent(onTextChange);
				}
			}
		}

		parentOfCaretNode.removeChild(caretNode);
        parentOfCaretNode.normalize();

    }


	// simple clean paste function
	function cleanPaste( event ){
		if (event.clipboardData && event.clipboardData.getData) {
			event.preventDefault();
			var html = autoLink( event.clipboardData.getData('text/plain') );
			document.execCommand('insertHTML', false, html);
		}
	}


	// are any parents of a node X tag
	function hasAncestorWithNodeType( node, tagName ){
		if(node && node.parentNode && node.parentNode.tagName && node.parentNode.tagName === tagName){
			return true;
		}else{
			if(node && node.parentNode){
				return hasAncestorWithNodeType( node.parentNode, tagName )
			}else{
				return false;
			}
			
		}
	}



	return {
		init: init,
		saveState: saveState,
		getWordCount: getWordCount
	}

})();