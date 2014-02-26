var story_type_icon = {
  'feature': 'star',
  'bug'    : 'fire',
  'chore'  : 'cog'
}
var members_iter=1;
var total = 1;
function get_data(){
  $("#mytable").html("<tr></tr>");
  $("#mytable").hide();
  var token = $("#mytoken").val();
  var myproject = $("#myproject").val();
  $( "tr" ).sortable({
                        placeholder: "widget_highlight_placeholder",
                        forcePlaceholderSize: true,
                        opacity: 0.5,
                        handle: ".panel-heading",
                });
  members_iter=0;
  total=10;
  show_progress();
  $.getJSON('https://www.pivotaltracker.com/services/v5/projects/'+myproject+'/memberships',{'token':token},function(r){
    total = r.length;
    members_iter = 1; 
    $.each(r,function(i,j){  //For each member
        var user_panel = $('<div class="panel panel-default"></div>');
        var panel_header = $(['<div class="panel-heading" id="',j.person.id,'">',
          '<h3 class="panel-title">',j.person.name,'</h3>',
          '<button type="button" class="btn btn-default btn-xs removeme" >',
            '<span class="glyphicon glyphicon-remove"></span>',
          '</button>',
          '<button type="button" class="btn btn-default btn-xs refreshme" >',
            '<span class="glyphicon glyphicon-refresh"></span>',
          '</button>',
          '</div>'].join(""));
        user_panel.append(panel_header);
        user_panel.append($('<div class="panel-body"></div>'));
        $("#mytable tr").append($("<td></td>").append(user_panel));
        get_member_stories(j.person.id,show_progress);
    });
  });
}

function get_member_stories(person_id,sync_function){
  var myproject = $("#myproject").val();
  var token = $("#mytoken").val();
  var panel_body = $("#"+person_id).parent().children(".panel-body"); 
  panel_body.html('<div id="loading'+person_id+'"><center><img src="images/loading.gif"></center></div>')
  $.getJSON('https://www.pivotaltracker.com/services/v5/projects/'+myproject+'/search',
  {'token':token, 'query':'owner:'+person_id},
  function(s){
    var done_stories = (parseInt(s.stories.total_hits_with_done) - parseInt(s.stories.total_hits)).toString();
    panel_body.append('<div class="done_stories">'+ done_stories +' Stories Done.</div>');
    $.each(s.stories.stories,function(x,y){ // For each Story 
        var story_panel_body=$([
        '<div data-toggle="tooltip" ',
             'data-placement="bottom" ',
             'title="" ',
             'class="story_body">',
          '<div class="story_header">',
          '  <span class="glyphicon"></span> ',
          '  <span class="estimate">',(y.estimate||'Unestimated'),'</span>',
          '  <a style="float: right" target="_blank" href="',y.url,'">' , y.id , '</a>',
          '</div>',
          '<div class="story_name"></div>',
        '</div>'].join(""));
        story_panel_body.find(".glyphicon").addClass('glyphicon-'+story_type_icon[y.story_type])
        story_panel_body.attr("title",y.description);
        story_panel_body.find(".story_name").html(y.name);
        story_panel_body.addClass(y.current_state);
        story_panel_body.tooltip();
        panel_body.append(story_panel_body);
     });
     $("#loading"+person_id).remove();
     if(typeof(sync_function)!='undefined'){sync_function();}
  });
}

/* -------- Functions -------------*/
$(document).on('click','.refreshme',function(){get_member_stories($(this).parent().attr("id"));});
$(document).on('click','.removeme',function(){$(this).parent().parent().parent().remove();});
function remove_inactive(){
  $(".panel-body").filter(function(i,j){return $(j).find(".story_body").length==0}).parent().parent().remove();
}
/* -------- Functions -------------*/



function show_progress(){
    var progress=(parseInt(100*members_iter/total)).toString()
    $("#loading_bar").html([
      '<div class="progress">',
      '  <div class="progress-bar" ',
             'role="progressbar" ',
             'aria-valuenow="',progress+'" ',
             'aria-valuemin="0" ',
             'aria-valuemax="100" ',
             'style="width:',progress,'%;">',progress,'%</div>',
      '</div>'].join(""));
     if(members_iter==total){$("#loading_bar").html("");$("#mytable").show();}
     members_iter += 1;
}
