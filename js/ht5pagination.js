function init_pagination(total, byPages, browse, has_more, pageNumber) {
    browse = browse;
    if(browse === false) {
        $("#search_results p").empty().append(_("Around %s results found", total)).show();
    }
    if (pageNumber !== 0) {
        $("#pagination").pagination({
            displayedPages: 5,
            pages: pageNumber,
            currentPage: current_page,
            cssStyle: 'compact-theme',
            edges: 1,
            revText: '' + _("Prev") + '',
            nextText: '' + _("Next") + '',
            onPageClick: changePage
        });
        pagination_init = true;
        total_pages = $("#pagination").pagination('getPagesCount');
    } else if ((browse === false) && (pagination_init === false)) {
        $("#search_results p").empty().append(_("Around %s results found", total)).show();
        $("#pagination").pagination({
            items: total,
            itemsOnPage: byPages,
            displayedPages: 5,
            cssStyle: 'compact-theme',
            edges: 1,
            revText: '' + _("Prev") + '',
            nextText: '' + _("Next") + '',
            onPageClick: changePage
        });
        pagination_init = true;
        total_pages = $("#pagination").pagination('getPagesCount');
    } else {
        if ((browse === true) && (pagination_init === false)) {
            $("#search_results p").empty().append(_("Browsing mode, use the pagination bar to navigate") + "<span></span>").show();
            $("#pagination").pagination({
                itemsOnPage: byPages,
                pages: current_page + 1,
                currentPage: current_page,
                displayedPages: 5,
                cssStyle: 'compact-theme',
                edges: 1,
                prevText: '' + _("Prev") + '',
                nextText: '' + _("Next") + '',
                onPageClick: changePage
            });
            if (has_more === true) {
                pagination_init = false;
            } else {
                pagination_init = true;
            }
        }
        total_pages = $("#pagination").pagination('getPagesCount');
    }
}
