var steps;
var speed = 1;//the user will be able to speed it up or slow it down, 0.25x to 4.0x
var order = "inOrder";
var paused = true;

function initSteps(){
  steps = new Sequence([new Frame(root)]);
}

function Frame(tree, tableInstr=null){
  this.tree = cloneTree(tree);
  this.tableInstr = tableInstr;
  this.display = () => {
      root = this.tree;
      drawAll("drawing");
      if(tableInstr == null){
        unhighlightCells();
      }
      else{
        highlightCell(tableInstr[0],tableInstr[1]);
      }
  };
}

function Sequence(frames){
  this.frames = frames;
  this.selectedFrame = null;
  if(frames.length > 0){
    this.selectedFrame = frames[0];
  }
  this.selectedFrameidx = 0;
  this.addFrame = (newFrame) => {
      this.frames.push(newFrame);
      this.selectedFrame = this.frames[this.selectedFrameidx];
    };
  this.loadFrame = () => {this.selectedFrame.display();};
  this.selectFirst = firstFrame;
  this.selectLast = lastFrame;
  this.selectPrev = prevFrame;
  this.selectNext = nextFrame;
}

function firstFrame(){
  this.selectedFrameidx = 0;
  this.selectedFrame = this.frames[this.selectedFrameidx];
  disableButton(0,1);
  enableButton(3,4);
}

function lastFrame(){
  this.selectedFrameidx = this.frames.length-1;
  this.selectedFrame = this.frames[this.selectedFrameidx];
  disableButton(3,4);
  enableButton(0,1);
}

function nextFrame(){
  if(this.selectedFrameidx != this.frames.length - 1){
    this.selectedFrameidx++;
  }
  this.selectedFrame = this.frames[this.selectedFrameidx];
  if(this.selectedFrameidx == this.frames.length-1){
    disableButton(3,4);
    paused = true;
  }
  enableButton(0,1);
}

function prevFrame(){
  if(this.selectedFrameidx != 0){
    this.selectedFrameidx--;
  }
  this.selectedFrame = this.frames[this.selectedFrameidx];
  if(this.selectedFrameidx == 0){
    disableButton(0,1);
  }
  enableButton(3,4);
}

function showFirst(){
  steps.selectFirst();
  steps.loadFrame();
  paused = true;
}

function showLast(){
  steps.selectLast();
  steps.loadFrame();
  paused = true;
}

function showNext(){
  steps.selectNext();
  steps.loadFrame();
}

function showPrev(){
  if(steps.selectedFrameidx == 0){
    return;
  }
  steps.selectPrev();
  steps.loadFrame();
}

function compileMinimax(){
  if(!isTree(root)){
    alert("Must assign values to all leaf nodes first.");
    return;
  }
  isEditing = false;
  showButtons();
  disableButton(0,1);
  enableButton(3,4);
  drawTreeCode(toTreeCode(root));
  initSteps();
  //console.log(steps);
  //steps.loadFrame();
  compileMinimaxHelper(root, root, steps);//the first frame holds the starting configuration
  root.status = SEARCHED;
  steps.addFrame(new Frame(root));
}

function compileMinimaxHelper(tree, selectedNode, frames){
  selectedNode.status = BOLD;
  if(selectedNode.parent != null){
    selectedNode.parent.status = SEARCHING;
  }
  frames.addFrame(new Frame(tree));
  for(var i = 0; i < selectedNode.children.length; i++){
    var nextNode = selectedNode.children[i];
    compileMinimaxHelper(tree,nextNode,frames);
    if(selectedNode.type == MAXIE){
      if(selectedNode.val == null){
        selectedNode.val = Number.NEGATIVE_INFINITY;
      }
      selectedNode.val = Math.max(selectedNode.val, nextNode.val);
    }
    if(selectedNode.type == MINNIE){
      if(selectedNode.val == null){
        selectedNode.val = Number.POSITIVE_INFINITY;
      }
      selectedNode.val = Math.min(selectedNode.val, nextNode.val);
    }
    nextNode.status = SEARCHED;
    selectedNode.status = BOLD;
    frames.addFrame(new Frame(tree));
  }
}

function compileAlphaBeta(){
  if(!isTree(root)){
    alert("Must assign values to all leaf nodes first.");
    return;
  }
  isEditing = false;
  showButtons();
  disableButton(0,1);
  enableButton(3,4);
  drawTreeCode(toTreeCode(root));
  initSteps();
  //console.log(steps);
  //steps.loadFrame();
  compileAlphaBetaHelper1(root, root, steps);//the first frame holds the starting configuration
  steps.addFrame(new Frame(root));
  const nodes = compileAlphaBetaHelperFlatten(root, []);
  compileAlphaBetaHelperRevealLeaves(root, nodes, steps);//the first frame holds the starting configuration
  if(root.status != PRUNED){
    root.status = SEARCHED;
    steps.addFrame(new Frame(root));
  }
  else{
    steps.addFrame(new Frame(root));
    root.status = SEARCHED;
    steps.addFrame(new Frame(root));
  }
}

function compileAlphaBetaHelper1(tree,selectedNode,frames) {
  let i = 0;
  selectedNode.alpha = Number.NEGATIVE_INFINITY;
  selectedNode.beta = Number.POSITIVE_INFINITY;
  while (i < selectedNode.children.length) {
    compileAlphaBetaHelper1(tree, selectedNode.children[i++], frames)
  }
}
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}
function compileAlphaBetaHelperRevealLeaves(tree, nodes, frames) {
  if (order === "inOrder") {
  } else if (order === "reverse") {
    nodes.reverse();
  } else if (order === "random") {
    shuffle(nodes);
  } else {
    throw new Error();
  }
  for (let i = 0; i < nodes.length; i++) {
    const selectedNode = nodes[i];
    if (selectedNode.children.length === 0 && selectedNode.status === UNSEARCHED) {
      compileAlphaBetaHelperRevealLeaf(tree, selectedNode, frames);
    }
  }
}

function compileAlphaBetaHelperRevealLeaf(tree,selectedNode,frames) {
    compileAlphaBetaHelper3(tree, selectedNode, frames);
    selectedNode.status = SEARCHED;
    selectedNode.alpha = selectedNode.val;
    selectedNode.beta = selectedNode.val;
    frames.addFrame(new Frame(tree));
    compileAlphaBetaHelper4(tree, selectedNode, true, frames);
}


function compileAlphaBetaHelperFlatten(selectedNode, acc) {
  let i = 0;
  acc.push(selectedNode);
  while (i < selectedNode.children.length) {
    compileAlphaBetaHelperFlatten(selectedNode.children[i++], acc);
  }
  return acc;
}
function compileAlphaBetaHelper3(tree, selectedNode, frames) {
  if (selectedNode.alpha === selectedNode.beta) {
    selectedNode.status = SEARCHED;
  } else {
    selectedNode.status = SEARCHING;
  }
  if (selectedNode.parent === null) {
    return;
  }
  compileAlphaBetaHelper3(tree, selectedNode.parent, frames);
}

function compileAlphaBetaHelper4(tree, selectedNode, changed, frames) {
  var tableInstr = null;
  if (selectedNode.children.every((c) => c.status === SEARCHED || c.status === PRUNED)) {
    if (selectedNode.type === MAXIE) {
      selectedNode.beta = selectedNode.alpha;
      changed = true;
    }
    if (selectedNode.type === MINNIE) {
      selectedNode.alpha = selectedNode.beta;
      changed = true;
    }
    selectedNode.status = SEARCHED;
  } else {
    selectedNode.status = SEARCHING;
  }

  if (selectedNode.parent !== null) {
    if (selectedNode.parent.type === MAXIE && selectedNode.parent.alpha < selectedNode.alpha) {
      selectedNode.parent.alpha = selectedNode.alpha;
      tableInstr = [0, 0];
      changed = true;
    }
    if (selectedNode.parent.type === MINNIE && selectedNode.parent.beta > selectedNode.beta) {
      selectedNode.parent.beta = selectedNode.beta;
      tableInstr = [1, 2];
      changed = true;
    }
    if (selectedNode.beta < selectedNode.parent.alpha || selectedNode.alpha > selectedNode.parent.beta) {
      if (selectedNode.parent.type === MAXIE) {
        tableInstr = [0, 1];
      } else {
        tableInstr = [1, 1];
      }
      let i = 0;
      while (i < selectedNode.children.length) {
        if (selectedNode.children[i].status === UNSEARCHED) {
          discardFrom(selectedNode.children[i]);
          selectedNode.status = PRUNED;
          changed = true;
        }
        i++;
      }
    }
  }
  if (tableInstr === null && selectedNode.parent !== null) {
    if (selectedNode.parent.type === MAXIE) {
      tableInstr = [0, 2];
    } else {
      tableInstr = [1, 0];
    }
  }
  if (changed) {
    const oldStatus = selectedNode.status;
    selectedNode.status = BOLD;
    let oldParentStatus;
    if (selectedNode.parent !== null) {
      oldParentStatus = selectedNode.parent.status;
      selectedNode.parent.status = BOLD;
    }
    frames.addFrame(new Frame(tree, tableInstr));
    selectedNode.status = oldStatus;
    if (selectedNode.parent !== null) {
      selectedNode.parent.status = oldParentStatus;
    }

  }
  if (selectedNode.parent !== null) {
    compileAlphaBetaHelper4(tree, selectedNode.parent, false, frames);
  }
/*



  selectedNode.status = BOLD;
  frames.addFrame(new Frame(tree));
  while(i < selectedNode.children.length && !pruneRest){
    var treeInstr = null;
    var nextNode = selectedNode.children[i];
    compileAlphaBetaHelper(tree,nextNode,selectedNode.alpha,selectedNode.beta,frames);

    if(selectedNode.type == MAXIE){
      if(selectedNode.val == null){
        selectedNode.val = Number.NEGATIVE_INFINITY;
      }
      selectedNode.val = Math.max(selectedNode.val, nextNode.val);
      if(nextNode.val >= selectedNode.beta){
        //We're maxie, so we prune.
        tableInstr = [0,2];
        pruneRest = true;
      }
      else if(nextNode.val > selectedNode.alpha){
        tableInstr = [0,1];
        selectedNode.alpha = nextNode.val;
      }
      else{
        tableInstr = [0,0];
      }
    }

    if(selectedNode.type == MINNIE){
      if(selectedNode.val == null){
        selectedNode.val = Number.POSITIVE_INFINITY;
      }
      selectedNode.val = Math.min(selectedNode.val, nextNode.val);
      if(nextNode.val <= selectedNode.alpha){
        //We're minnie, so we prune.
        tableInstr = [1,0];
        pruneRest = true;
      }
      else if(nextNode.val < selectedNode.beta){
        tableInstr = [1,1];
        selectedNode.beta = nextNode.val;
      }
      else{
        tableInstr = [1,2];
      }
    }
    if(nextNode.status != PRUNED){
      nextNode.status = SEARCHED;
    }
    selectedNode.status = BOLD;
    frames.addFrame(new Frame(tree,tableInstr));
    i++;
  }
  //now, add the pruning frame
  while(i < selectedNode.children.length){
    discardFrom(selectedNode.children[i]);
    i++;
  }
  if(pruneRest){
    frames.addFrame(new Frame(tree));
    selectedNode.status = PRUNED;
  } else {
    if (selectedNode.type === MINNIE) {
      selectedNode.alpha = selectedNode.beta;
    }
    if (selectedNode.type === MAXIE) {
      selectedNode.beta = selectedNode.alpha;
    }
  }*/
}

function discardFrom(rootNode){
  rootNode.status = DISCARDED;
  for(var i = 0; i < rootNode.children.length; i++){
    discardFrom(rootNode.children[i]);
  }
}

function playBtnClick(){
  if(paused && steps.selectedFrameidx != steps.frames.length - 1){
    paused = false;
    //disable the dropdown buttons
    disableNavbar();
    disableButton(1,3);
    //rename the button
    $("#button2").text("Pause");
    animate();
  }
  else{
    paused = true;
    enableNavbar();
    enableButton(1);
    if(steps.selectedFrameidx != steps.frames.length - 1){
      enableButton(3);
    }
    //rename the button
    $("#button2").text("Play");
  }
}

function animate(){
  showNext();
  if(paused || steps.selectedFrameidx == steps.frames.length - 1){
    $("#button2").text("Play");
    enableNavbar();
    enableButton(1);
    if(steps.selectedFrameidx == steps.frames.length - 1){
      disableButton(3);
    }
    return;
  }
  setSpeed(parseFloat(document.getElementById("speed").options[document.getElementById("speed").selectedIndex].value));
  disableButton(1);
  // request another animation loop
  var frameTime = 1500/speed;
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, frameTime);
}



function setSpeed(rate){
  speed = rate;
}

function setOrder(value) {
  order = value;
  compileAlphaBeta();
}