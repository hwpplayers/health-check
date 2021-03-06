/* global ajaxurl, SiteHealth */
jQuery( document ).ready( function( $ ) {
	const isDebugTab = $( '.health-check-debug-tab.active' ).length;
	const pathsSizesSection = $( '#health-check-accordion-block-wp-paths-sizes' );

	function getDirectorySizes() {
		const data = {
			action: 'health-check-get-sizes',
			_wpnonce: SiteHealth.nonce.site_status_result,
		};

		const timestamp = ( new Date().getTime() );

		// After 3 seconds announce that we're still waiting for directory sizes.
		const timeout = window.setTimeout( function() {
			wp.a11y.speak( SiteHealth.string.please_wait );
		}, 3000 );

		$.post( {
			type: 'POST',
			url: ajaxurl,
			data,
			dataType: 'json',
		} ).done( function( response ) {
			updateDirSizes( response.data || {} );
		} ).always( function() {
			let delay = ( new Date().getTime() ) - timestamp;

			$( '.health-check-wp-paths-sizes.spinner' ).css( 'visibility', 'hidden' );

			if ( delay > 3000 ) {
				// We have announced that we're waiting.
				// Announce that we're ready after giving at least 3 seconds for the first announcement
				// to be read out, or the two may collide.
				if ( delay > 6000 ) {
					delay = 0;
				} else {
					delay = 6500 - delay;
				}

				window.setTimeout( function() {
					wp.a11y.speak( SiteHealth.string.site_health_complete );
				}, delay );
			} else {
				// Cancel the announcement.
				window.clearTimeout( timeout );
			}

			$( document ).trigger( 'site-health-info-dirsizes-done' );
		} );
	}

	function updateDirSizes( data ) {
		const copyButton = $( 'button.button.copy-button' );
		let clipdoardText = copyButton.attr( 'data-clipboard-text' );

		$.each( data, function( name, value ) {
			const text = value.debug || value.size;

			if ( 'undefined' !== typeof text ) {
				clipdoardText = clipdoardText.replace( name + ': loading...', name + ': ' + text );
			}
		} );

		copyButton.attr( 'data-clipboard-text', clipdoardText );

		pathsSizesSection.find( 'td[class]' ).each( function( i, element ) {
			const td = $( element );
			const name = td.attr( 'class' );

			if ( data.hasOwnProperty( name ) && data[ name ].size ) {
				td.text( data[ name ].size );
			}
		} );
	}

	if ( isDebugTab ) {
		if ( pathsSizesSection.length ) {
			getDirectorySizes();
		}
	}
} );
