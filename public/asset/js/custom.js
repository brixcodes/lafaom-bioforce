// jQuery(document).ready(function ($) {

//     let ajaxState = false;
//     const formationPostsCarrousel = () => {
//         let owl = $(".formations-list-posts:not(.owl-loaded)");
//         if (!owl.length > 1) return;
//         $.each(owl, function () {
//             $(owl).owlCarousel({
//                 items: 1,
//                 loop: true,
//                 margin: 40,
//             });
//         });
//     };

//     const filterHandler = () => {
//         let loader = '<div class="wait-loading"></div>';
//         $(document).on('submit', '.filters form', function (event, pageId) {
//             event.preventDefault();

//             let target = $(this).parents('.filters').data('target');
//             let htmlText = $(this).parents('.filters').data('noresult');
//             if (!ajaxState) {
//                 ajaxState = true;
//                 $('body').append(loader);
//                 pageId = pageId == "undefined" ? 1 : pageId;
//                 $(this).find('input[name="page"]').val(pageId);
//                 let url = $(this).attr('action');
//                 let data = $(this).serialize();
//                 if ($('.page-template-page-formations').length) {
//                     history.pushState(null, null, "?" + data);
//                 }

//                 $.get(url, data, (result) => {
//                     let obj = JSON.parse(result);
//                     let content = (obj.items == "") ? `<p class="no-result">${htmlText}</p>` : obj.items;
//                     if (obj.items == "") {
//                         $('<p class="no-result">Vous Ãªtes arrivÃ© Ã  la fin de la liste !</p>').appendTo($(target));
//                         $('.load-more-formations').remove();
//                     } else {
//                         $(content).appendTo($(target));
//                     }
//                     if (window.innerWidth <= 640) {
//                         formationPostsCarrousel();
//                     }
//                 }).done(() => {
//                     ajaxState = false;
//                     $('.wait-loading').remove();
//                     setTimeout(() => {
//                         pageId++;
//                         $('.load-more-formations').attr('data-target', pageId);
//                     }, 1000);
//                     if (window.innerWidth <= 640) {
//                         formationPostsCarrousel();
//                     }
//                 });
//             }
//         })
//     };
//     const paginationHandler = () => {
//         $(document).on('click', '.load-more-formations', function (event) {
//             event.preventDefault();

//             let currentPageFilters = $('#filtersForm form input[name="page"]').val();
//             currentPageFilters++;
//             $('#filtersForm form input[name="page"]').val(currentPageFilters);

//             if (!ajaxState) {
//                 let pageId = currentPageFilters;
//                 let form = $('.filters form');
//                 form.trigger('submit', [pageId]);
//             }
//         });
//     }

//     const scrollToCity = () => {
//         window.addEventListener('click', function (e) {
//             if (!e.target.parentElement.classList.contains('post-formation-sing-up')) {
//                 return;
//             }
//             let section = document.querySelector('.details-formation-sessions');
//             section.scrollIntoView({ behavior: "smooth" });
//             let el = document.querySelector('.list-session .ss-single-selected');
//             if (el !== null){
//                 el.classList.add('s-open-below');
//             }
//             document.querySelector('.list-session .ss-content').classList.add('ss-open');
//         })
//     }

//     const detectCityChanges = () => {
//         // Select the node that will be observed for mutations
//         var target = document.querySelectorAll(".s-select");
//         for (var i = 0; i < target.length; i++) {
//             create(target[i]);
//         }

//         function create(t) {
//             // create an observer instance
//             var observer = new MutationObserver(function (mutations) {
//                 mutations.forEach(function (mutation) {
//                     if (mutation.type === 'attributes'){
//                         if (mutation.target.className === 'ss-deselect ss-hide'){
//                             document.querySelector('.list-session .ss-content').classList.remove('ss-open');
//                         }
//                     }
//                 });
//             });
//             // configuration of the observer
//             var config = {
//                 attributes: true,
//                 subtree: true,
//                 childList: true
//             };

//             // pass in the target node, as well as the observer options
//             observer.observe(t, config);
//         }
//     }

//     filterHandler();
//     paginationHandler();
//     scrollToCity();
//     setTimeout(() => {
//         detectCityChanges();
//     }, 2000);
// });

function getCookie(name) {
    // Split cookie string and get all individual name=value pairs in an array
    let cookieArr = document.cookie.split(";");
    
    // Loop through the array elements
    for(let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        
        /* Removing whitespace at the beginning of the cookie name
        and compare it with the given string */
        if(name == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }
    
    // Return null if not found
    return null;
}
jQuery(document).ready(function ($) {

    let ajaxState = false;
    const formationPostsCarrousel = () => {
        let owl = $(".formations-list-posts:not(.owl-loaded)");
        if (!owl.length > 1) return;
        $.each(owl, function () {
            $(owl).owlCarousel({
                items: 1,
                loop: true,
                margin: 40,
            });
        });
    };

    const filterHandler = () => {
        let loader = '<div class="wait-loading"></div>';
        $(document).on('submit', '.filters form', function (event, pageId) {
            event.preventDefault();

            let target = $(this).parents('.filters').data('target');
            let htmlText = $(this).parents('.filters').data('noresult');
            if (!ajaxState) {
                ajaxState = true;
                $('body').append(loader);
                pageId = pageId == "undefined" ? 1 : pageId;
                $(this).find('input[name="page"]').val(pageId);
                let url = $(this).attr('action');
                let data = $(this).serialize();
                if ($('.page-template-page-formations').length) {
                    history.pushState(null, null, "?" + data);
                }

                $.get(url, data, (result) => {
                    let obj = JSON.parse(result);
                    let content = (obj.items == "") ? `<p class="no-result">${htmlText}</p>` : obj.items;
                    if (obj.items == "") {
                        let label = '';
                        switch (getCookie('wp-wpml_current_language')) {
                            case 'en':
                                label = 'Didnâ€™t find what you wanted ? Try a new search';
                                break;
                            case 'fr':
                                label = 'Vous Ãªtes arrivÃ© Ã  la fin de la liste !';
                                break;
                        }
                        $('<p class="no-result">' + label + '</p>').appendTo($(target));
                        $('.load-more-formations').remove();
                    } else {
                        $(content).appendTo($(target));
                    }
                    if (window.innerWidth <= 640) {
                        formationPostsCarrousel();
                    }
                }).done(() => {
                    ajaxState = false;
                    $('.wait-loading').remove();
                    setTimeout(() => {
                        pageId++;
                        $('.load-more-formations').attr('data-target', pageId);
                    }, 1000);
                    if (window.innerWidth <= 640) {
                        formationPostsCarrousel();
                    }
                });
            }
        })
    };
    const paginationHandler = () => {
        $(document).on('click', '.load-more-formations', function (event) {
            event.preventDefault();

            let currentPageFilters = $('#filtersForm form input[name="page"]').val();
            currentPageFilters++;
            $('#filtersForm form input[name="page"]').val(currentPageFilters);

            if (!ajaxState) {
                let pageId = currentPageFilters;
                let form = $('.filters form');
                form.trigger('submit', [pageId]);
            }
        });
    }

    const scrollToCity = () => {
        window.addEventListener('click', function (e) {
            if (!e.target.parentElement.classList.contains('post-formation-sing-up')) {
                return;
            }
            let section = document.querySelector('.details-formation-sessions');
            section.scrollIntoView({ behavior: "smooth" });
            let el = document.querySelector('.list-session .ss-single-selected');
            if (el !== null){
                el.classList.add('s-open-below');
            }
            document.querySelector('.list-session .ss-content').classList.add('ss-open');
        })
    }

    const detectCityChanges = () => {
        // Select the node that will be observed for mutations
        var target = document.querySelectorAll(".s-select");
        for (var i = 0; i < target.length; i++) {
            create(target[i]);
        }
        function create(t) {
            // create an observer instance
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === 'attributes'){
                        if (mutation.target.className === 'ss-deselect ss-hide'){
                            document.querySelector('.list-session .ss-content').classList.remove('ss-open');
                        }
                    }
                });
            });
            // configuration of the observer
            var config = {
                attributes: true,
                subtree: true,
                childList: true
            };
            // pass in the target node, as well as the observer options
            observer.observe(t, config);
        }
    }
    filterHandler();
    paginationHandler();
    scrollToCity();
    setTimeout(() => {
        detectCityChanges();
    }, 2000);
});