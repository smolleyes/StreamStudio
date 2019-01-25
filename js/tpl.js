<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
 
    <link href="http://twitter.github.com/bootstrap/assets/css/bootstrap.css" rel="stylesheet" />
 
    <title>Bootstrap modal confirm</title>
 
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.0.2/bootstrap.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.4.2/mustache.min.js"></script>
 
    <script id="modal-confirm-mjs" type="text/template">
        // Mustache template, use {% raw %}{% endraw %} if you render with jinja2
        <div class="modal" id="modal-confirm">
            <div class="modal-header">
                <a class="close" data-dismiss="modal">×</a>
                <h3>Modal header</h3>
            </div>
 
            <div class="modal-body">
                <p>{{ message }}</p>
            </div>
 
            <div class="modal-footer">
                <a class="btn" data-dismiss="modal">Close</a>
                <a class="btn btn-primary" data-action="save">Okay</a>
            </div>
        </div>
    </script>
 
 
 
    <script id="modal-prompt-mjs" type="text/template">
        <div class="modal" id="modal-prompt">
            <div class="modal-header">
                <a class="close" data-dismiss="modal">×</a>
                <h3>{{ message }}</h3>
            </div>
 
            <div class="modal-body">
                <p>
                    <input type="text" style="width: 518px" class="value" />
                </p>
            </div>
 
            <div class="modal-footer">
                <a class="btn" data-dismiss="modal">Close</a>
                <a class="btn btn-primary" data-action="save">Okay</a>
            </div>
        </div>
    </script>
 
    <script>
        (function ( $ ) {
 
            var modal = function ( message, template ) {
                var dfd = $.Deferred();
                var template = $(template).html();
                var render = $(Mustache.to_html(template, {message: message}));
 
                var onSave = function ( e ) {
 
                    if(e.type === "keyup" && e.keyCode !== 13)
                        return;
 
                    var input = render.find('input.value');
                    var value = input.length > 0 && input.val();
 
                    value ? dfd.resolve(value)
                          : dfd.resolve();
                    render.modal('hide');
 
                };
 
                render
                    .on('keyup.modal', '.value', onSave)
                    .on('click.modal', '[data-action="save"]', onSave)
                    .on('hidden', function () {
                        (dfd.state() == "pending") && dfd.reject();
                        $(this).remove();
                    })
                    .modal('show');
                render.find('input.value').focus();
 
                return dfd.promise();
            };
 
            $.confirm = function ( message ) {
                return modal(message, "#modal-confirm-mjs");
            };
 
            $.prompt = function ( message ) {
                return modal(message, "#modal-prompt-mjs");
            };
 
        })( window.jQuery );
    </script>
 
    <script>
        $(function () {
 
            $('a.confirm').on('click', function () {
 
                $.confirm("Are you sure you want confirm this ?")
                 .done(function () {
                    // things that happen when you press save
                    console.log('okay');
                 })
                 .fail(function () {
                    // things that happend when you press cancel
                    console.log('cancel');
                });
 
            });
 
            $('a.prompt').on('click', function () {
 
                $.prompt("Insert new value")
                 .done(function (value) {
                    console.log('okay', value);
                 })
                 .fail(function () {
                    console.log('cancel');
                 });
 
            });
 
        });
    </script>
</head>
 
<body>
    <div class="container">
        <div class="hero-unit">
            <h1>Hello, world!</h1>
 
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.</p>
            <p><a href="#" class="confirm">Toggle confirm</a></p>
            <p><a href="#" class="prompt">Toggle prompt</a></p>
        </div>
    </div>
</body>
 
</html>
