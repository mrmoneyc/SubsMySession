$(document).ready( function () {
  $('.gen-ics-file').click( function (e) {
    e.preventDefault();

    var chkSSNData = [];
    $(':checkbox:checked').each(function(i){
      chkSSNData.push($(this).val());
    });

    console.dir(chkSSNData);

    $.ajax({
      type: 'POST',
      url: '/gencal',
      dataType: 'json',
      data: {
        sid: chkSSNData
      },
      success: function (data) {
        $('.url-ics-file').html('<a href="' + data.url + '">' + data.url + '</a> <<= Copy this link and paste to your calendar to <a href="https://support.google.com/calendar/answer/37118" target="_blank">import</a> the selected schedule');
      },
      error: function (err) {
        console.log(err);
      }
    });

  });
});
