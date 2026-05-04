function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Run functions')
    .addItem('Run Manually', 'dailySalesLeadsRoutine')
    .addToUi();
}
