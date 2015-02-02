//

// Redirect if user does not have server_oauth set.
if (typeof(server_oauth) == 'undefined') {
	alert('Please authenticate with Twitter first.')
	location.href = '/auth/twitter';

} else {
	var cb = new Codebird;

	cb.setConsumerKey(server_oauth.consumer_key, server_oauth.consumer_secret);
	// cb.setToken(server_oauth.token_key, server_oauth.token_secret);


	$.each(server_oauth.people, function(idx,user) {
		console.log(idx,user)
    	$('#user-area').append("\
    		<li class=\"user\" data-user=\"" + idx +"\">\
    			<div class=\"arrow\"></div>\
	    		<div class=\"col-xs-offset-2  col-xs-4\">\
			   		<img src="+user.profile_photo+" class=\"img-responsive\" alt=\"80x80\" />\
				</div>\
			    <div class=\"col-xs-6\">\
			    	<h4>"+user.name+"</h4>\
			    	<!-- <h5><a href=\"https://twitter.com/"+user.screen_name+"\">@"+user.screen_name+"</a></h5> -->\
			    	<h5>@"+user.screen_name+"</h5>\
				</div>\
			</li>"
		);

		// $('#user-bg').prepend("\
		// 	<background="+reply.profile_background_image_url+"/>"
		// );
	});

	// define on document so DOM changes after defined event are reflected.
	$(document).on('click', '#user-area .user', function() {
		load_feed($(this).attr('data-user'));
		//return false;
	});


	function load_feed(idx) {
		// clear tweets hrml area
		$( "#tweets-area" ).html('');

		$('li.user').removeClass('selected'); // remove selected class from all list item
		$('li.user[data-user="' + idx +'"').addClass('selected'); // add only to list item user's element
		
		var user_info = server_oauth.people[idx];
		cb.setToken(user_info.token, user_info.token_secret);


		cb.__call(
			    "statuses_homeTimeline",
			    {"count": 20},
			    function (reply) {


			        $.each(reply, function(idx, tweet){
			        	$( "#tweets-area" ).prepend(" \
			         		<li>\
			          			<div class=\"container-fluid\">\
			          				<div class=\"col-xs-2\">\
			          					<img src="+tweet.user.profile_image_url+" class=\"img-responsive\" alt=\"\" />\
			          				</div>\
			          				<div class=\"col-xs-10\">\
			          				<ul class=\"tweetmain\">\
						    			<li><h5>"+tweet.user.name+" <a href=\"https://twitter.com/"+tweet.user.screen_name+"\"> @"+tweet.user.screen_name+"</a> </h5></li>\
						    			<li><p>" + tweet.text + "</p></li>\
						  			</ul>\
						  			</div>\
			          			</div>\
			          		</li>"
			           	);
						console.log(tweet);
			        });

			        // console.log(reply);
			    }
			);


	}

	// load feed from first person
	var first_user = Object.keys(server_oauth.people)[0]; // get hash key for first person
	load_feed(first_user);
}
