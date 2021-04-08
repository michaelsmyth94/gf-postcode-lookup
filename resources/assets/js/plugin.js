/**
 * The JavaScript functionality bound to the GF Postcode Look-up field
 * 
 * @since 1.0.0
 * @package GF_Postcode_Lookup
 */

// packages
import PostcodeException from './Exceptions/PostcodeException';
import AjaxException from './Exceptions/AjaxException';
import AddressException from './Exceptions/AddressException';

const Notifier = require('sweetalert2');
const Postcode = require('postcode');

// constants
const PREFIX = 'gfpcl';
const AJAX_URL = `${window.location.origin}/wp-admin/admin-ajax.php`;
const $ = window.jQuery;

const fieldAssociations = {
    line_1: '1',
    line_2: '2',
    city: 'city',
    county: 'county',
    postcode: 'postcode'
};

/**
 * A jQuery selector wrapper, specific to plugin elements
 */
const dollar = selector => $(`${selector.substr(0, 1)}${PREFIX}-${selector.substr(1)}`);

/**
 * Document initialisation
 */
$(function () {
    bindEvents();

    $(document).on('gform_post_render', () => {
        bindEvents();
    });

    $(document).on('click', '.result-list .result', function () {
        let $result = $(this);
        let lines = $result.data();
        let addressComponents = {};

        const $field = $result.parents('.ginput_container_postcode-lookup');
        const $trigger = $field.find('.gfpcl-lookup');
        const $addressFields = $field.find('.gfpcl-address-fields');
        const $searchWrap = $field.find('.gfpcl-initial');
        const $postcodeInput = $searchWrap.find($trigger.data('postcode-input'));
        const $resultDropdown = $searchWrap.find('.lookup-results');
        const $formToggle = $field.find('.gfpcl-form-toggle > a');
        const $fillableField = $field.find('.gfpcl-fillable');

        for (let line in lines) {
            if (line in fieldAssociations) {
                let $input = $(`#${$addressFields.attr('id')}_${fieldAssociations[line]}`);

                if ($input.length) {
                    $input.val(lines[line]);

                    if (line !== 'postcode') {
                        addressComponents[line] = lines[line].trim();
                    }
                }
            }
        }

        $resultDropdown.hide();
        $searchWrap.removeClass('results-visible').stop().slideUp();
        $addressFields.stop().slideDown();
        $formToggle.parent().hide();

        if (Object.keys(addressComponents).length) {
            addressComponents['postcode'] = $postcodeInput.val().trim();
            $fillableField.val(JSON.stringify(addressComponents));
        }
    });
});

const bindEvents = () => {
    const $fields = $(document).find('.ginput_container_postcode-lookup');

    if (!$fields.length) {
        return;
    }

    $fields.each((_index, field) => {
        const $trigger = $(field).find('.gfpcl-lookup');
        const $searchWrap = $(field).find('.gfpcl-initial');
        const $postcodeInput = $searchWrap.find($trigger.data('postcode-input'));
        const $resultDropdown = $searchWrap.find('.lookup-results');
        const $resultList = $resultDropdown.children('.result-list');
        const $addressFields = $(field).find('.gfpcl-address-fields');
        const $formToggle = $(field).find('.gfpcl-form-toggle > a');
        const $fillableField = $(field).find('.gfpcl-fillable');

        let limit = false;

        if ($trigger.length) {
            $trigger.on('click', function (event) {
                event.preventDefault();

                if (limit) {
                    return;
                }

                limit = true;

                $searchWrap.addClass('loading');
                $resultList.empty();

                try {
                    let userPostcode = validatePostcode($postcodeInput.val());
                    let request = $.ajax({
                        url: AJAX_URL,
                        method: 'POST',
                        data: {
                            action: 'gf-postcode-lookup',
                            postcode: userPostcode
                        },
                        success: response => {
                            $searchWrap.removeClass('loading');
                        
                            if (response.status === 200 && response.data.length > 0) {
                                sortAddresses(response.data, 'line_1');

                                for (let i in response.data) {
                                    let address = Object.filter(response.data[i], line => line.trim() !== '');

                                    let subLines = [];
                                    let $el = $('<li />', {
                                        class: 'result',
                                        html: `<p class="first-line">${address.line_1}</p>`
                                    });

                                    $el.data('postcode', userPostcode);

                                    for (let key in address) {
                                        let value = address[key];

                                        $el.data(key, value);

                                        if (key !== 'line_1') {
                                            subLines.push(`<span class="${key}">${value}</span>`);
                                        }
                                    }

                                    if (subLines.length) {
                                        $el.append(`<small class="sub-lines">${subLines.join(', ')}</small>`);
                                    }

                                    $el.appendTo($resultList);
                                }

                                $resultDropdown.show();
                                $searchWrap.addClass('results-visible');
                            } else {
                                // @TODO we need proper handling for the API status
                                throw new PostcodeException("We couldn't find any addresses matching the given postcode");
                            }
                        },
                        fail: (error, message) => {
                            throw new AjaxException(error);
                        }
                    }).always(() => {
                        setTimeout(() => {
                            limit = false;
                        }, 1000);
                    });
                } catch (e) {
                    $searchWrap.removeClass('loading');

                    Notifier(e.message);

                    setTimeout(() => {
                        limit = false;
                    }, 1000);
                }
            });

            $postcodeInput.on('keyup keydown', function (event) {
                if (event.keyCode === 13) {
                    event.stopPropagation();
                    event.preventDefault();

                    $trigger.trigger('click');
                }
            });

            $formToggle.on('click', function (event) {
                event.preventDefault();

                let $toggle = $(this);

                if ($toggle.hasClass('manual')) {
                    $toggle.removeClass('manual').text($toggle.data('default'));
                } else {
                    $toggle.addClass('manual').text($toggle.data('manual'));
                }

                $searchWrap.stop().slideToggle();
                $addressFields.stop().slideToggle();
            });

            /**
                * Concatenate address fields if changed manually to re-populate the fillable field
                */
            let $addressFieldInputs = $addressFields.find('input');

            $addressFieldInputs.on('keyup', function () {
                let addressComponents = {};

                $addressFieldInputs.each(function () {
                    let $input = $(this);

                    addressComponents[$input.data('line')] = $input.val().trim();
                });

                if (Object.keys(addressComponents).length) {
                    $fillableField.val(JSON.stringify(addressComponents));
                }
            });
        }
    });
}

/**
 * Response handler functions
 */
const handleSuccessfulLookup = data => {
    console.log(data);
};

/**
 * Postcode validation wrapper that throws an error if the postcode isn't valid
 */
const validatePostcode = postcode => {
    postcode = new Postcode(postcode);

    if (!postcode.valid()) {
        throw new PostcodeException('The postcode provided is not valid');
    }

    return postcode.normalise();
};

/**
 * Sort the list of addresses in numerical order
 */
const sortAddresses = (addresses, key) => {
    if (!addresses) {
        throw new AddressException('Please provide some addresses');
    }

    addresses.sort(function (a, b) {
        if (key) {
            a = Number.parseInt(a[key]);
            b = Number.parseInt(b[key]);
        } else {
            a = Number.parseInt(a);
            b = Number.parseInt(b);
        }

        if (a === b) {
            return 0;
        }

        return a > b ? 1 : -1
    });
};

/**
 * Additional methods
 */
Object.filter = (obj, predicate) => Object.keys(obj).filter(key => predicate(obj[key])).reduce((res, key) => (res[key] = obj[key], res), {});
