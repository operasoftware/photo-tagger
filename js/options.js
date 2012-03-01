(function()
{
    var widget = window.widget||{};

    // storage
    var storage = widget.preferences||localStorage;

    // glue for multiple values ( checkbox, select-multiple )
    var glue    = '\n';

    // get the FORM elements
    var formElements = document.querySelectorAll( 'input,select' );

    // list of
    var skip            = hash( 'hidden submit image reset button' );
    var multipleValues  = hash( 'checkbox select-multiple' );
    var checkable       = hash( 'checkbox radio' );



    // string to hash
    function hash( str, glue )
    {
        var obj = {};
        var tmp = str.split(glue||' ');

        while( tmp.length )
            obj[ tmp.pop() ] = true;

        return obj;
    }


    // walk the elements and apply a callback method to them
    function walkElements( callback )
    {
        var obj = [];
        for( var i=0,element=null; element=formElements[i++]; )
        {
            // skip the element if it has no name or is of a type with no useful value
            var type = element.type.toLowerCase();
            var name = element.name||'';
            if( skip[type]===true || name=='') continue;

            var tmp = callback( element, name, type );
            if( tmp!=null )
                obj.push( tmp );
        }
        return obj;
    }


    // listener for element changes
    function changedElement( e )
    {
        var element = e.currentTarget;
        var type    = element.type.toLowerCase();
        var name    = element.name||'';

        var value   = multipleValues[type]!==true?element.value:walkElements
        (
            function( e, n, t )
            {
                if( n==name && e.options )
                {
                    var tmp = [];
                    for( var j=0,option=null; option=e.options[j++]; )
                    {
                        if( option.selected )
                        {
                            tmp.push( option.value );
                        }
                    }
                    return tmp.join( glue );
                }
                else if( n==name && checkable[t]===true && e.checked )
                {
                    return e.value;
                }
            }
        ).join( glue );

        if (type == 'number'){
            value = parseInt(value);
            if (!value) value = storage.getItem(name);
            element.value = value;
        }
        // set value
        storage.setItem( name, value );
    }



    //
    function $( id, txt, href )
    {
        var e = document.getElementById(id);
        if( e )
        {
            e.textContent = txt;
            if( href||'' )
            {
                e.href = href||'#';
            }
        }
    }


    // walk and set the elements accordingly to the storage
    walkElements
    (
        function( element, name, type )
        {
            var value       = storage[name]!==undefined?storage.getItem( name ):element.value;
            var valueHash   = hash( value, glue );

            if( element.selectedOptions )
            {
                // 'select' element
                for( var j=0,option=null; option=element.options[j++]; )
                {
                    option.selected = valueHash[option.value]===true;
                }
            }
            else if( checkable[type]===true)
            {
                if (storage[name]){
                    // 'radio' or 'checkbox'
                    element.checked = valueHash[element.value]===true;
                }
                else{
                    element.checked = false;
                }
            }
            else
            {
                // anything other kind of element
                element.value = value;
            }


            // listen to changes
            element.addEventListener( 'change', changedElement, true );
        }
    )

})();
