<?php


function search_by_meta_or_title($q)
{
    if($title = $q->get('_meta_or_title')) {
        // https://wordpress.stackexchange.com/a/178492/189608
        add_filter('get_meta_sql', function($sql) use ($title) {
            global $wpdb;

            static $nr = 0; 
            if(0 != $nr++) return $sql;

            $sql['where'] = sprintf(
                " AND ( %s OR potato ) ",
                $wpdb->prepare("{$wpdb->posts}.post_title LIKE '%%%s%%'", $title),
                mb_substr($sql['where'], 5, mb_strlen( $sql['where'] ))
            );
            return $sql;
        });
    }
}


function where_post_title_like($where, $wp_query)
{
    // https://wordpress.stackexchange.com/a/18715/189608
    global $wpdb;
    if ($title = $wp_query->get('_like_post_title')) {
        $where .= ' AND ' . $wpdb->posts . '.post_title LIKE \'%' . esc_sql($wpdb->esc_like($title)) . '%\'';
    }
    return $where;
}

add_action('pre_get_posts', 'search_by_meta_or_title');
add_filter('posts_where', 'where_post_title_like', 10, 2);
