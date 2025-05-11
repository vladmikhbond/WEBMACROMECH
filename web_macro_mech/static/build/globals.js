export let glo = {
    W: 0.5, // loss of energу when two balls strikes ( 0 - no loss)
    U: 0.05, // loss of energу when link reacts ( 0 - no loss)
    Vis: 0, // drag coeff   ( 0 - no drag)
    K: 100, // modulus of elasticity of a ball     
    g: 0.005, // acceleration of gravity  
    INTERVAL: 10, // interval between two ticks 
    chronos: 0, // modell time in ticks (1 sec = 1000/INTERVAL ticks)
    showBallDeform: true, // show the deformation of a ball
    Kvelo: 100, // for velocity drawing
    doCounStrikes: false, // checking if the ball strikes are counted
    strikeCounter: 0, // strikes counter
};
export const doc = {
    canvas: document.getElementById("canvas"),
    canvas2: document.getElementById("canvas2"),
    mousePosSpan: document.getElementById("mousePosSpan"),
    infoSpan: document.getElementById("infoSpan"),
    createModeButton: document.getElementById("createModeButton"),
    traceModeButton: document.getElementById("traceModeButton"),
    modeButton: document.getElementById("modeButton"),
    prettyButton: document.getElementById("prettyButton"),
    updateButton: document.getElementById("updateButton"),
    helpButton: document.getElementById("helpButton"),
    graviRange: document.getElementById("graviRange"),
    waistRange: document.getElementById("waistRange"),
    waistLinkRange: document.getElementById("waistLinkRange"),
    waistFrictRange: document.getElementById("waistFrictRange"),
    rigidRange: document.getElementById("rigidRange"),
    graviValue: document.getElementById("graviValue"),
    waistValue: document.getElementById("waistValue"),
    waistLinkValue: document.getElementById("waistLinkValue"),
    waistFrictValue: document.getElementById("waistFrictValue"),
    rigidValue: document.getElementById("rigidValue"),
    rangesDiv: document.getElementById("rangesDiv"),
    scenesDiv: document.getElementById("scenesDiv"),
    sceneSelect: document.getElementById("sceneSelect"),
    modeGlif: document.getElementById("modeGlif"),
    restartButton: document.getElementById("restartButton"),
    problemBoard: document.getElementById("problemBoard"),
    ballBoard: document.getElementById("ballBoard"),
    lineBoard: document.getElementById("lineBoard"),
    condDiv: document.getElementById("condDiv"),
    answerText: document.getElementById("answerText"),
    answerButton: document.getElementById("answerButton"),
    applyBallButton: document.getElementById("applyBallButton"),
    applyLineButton: document.getElementById("applyLineButton"),
    redBallImg: document.getElementById("redBallImg"),
    greenBallImg: document.getElementById("greenBallImg"),
    blueBallImg: document.getElementById("blueBallImg"),
    goldBallImg: document.getElementById("goldBallImg"),
    saveSceneButton: document.getElementById("saveSceneButton"),
    loadSceneButton: document.getElementById("loadSceneButton"),
    savedSceneArea: document.getElementById("savedSceneText"),
    adminButton: document.getElementById("adminButton"),
    adminSpan: document.getElementById("adminSpan"),
    addProblemButton: document.getElementById("addProblemButton"),
    editProblemButton: document.getElementById("editProblemButton"),
    delProblemButton: document.getElementById("delProblemButton"),
    header: document.getElementById("header"), // 
};
