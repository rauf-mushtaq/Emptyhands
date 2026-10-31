<?php
/* EmptyHands: send visitors of the old WordPress site to the new website.
   Paste into WordPress > WPCode > Add Snippet > "Add Your Custom Code" > Code type: PHP Snippet,
   Location: "Run Everywhere", then Activate. Deactivate the snippet to undo instantly.
   wp-admin and the login page keep working, so you can always get back in. */
add_action('template_redirect', function () {
    if (is_admin() || is_user_logged_in()) return;   // you (logged in as admin) still see the old site

    $new  = 'https://rauf-mushtaq.github.io/Emptyhands/';
    $path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');

    $pages = array(
        ''                                    => '',
        'karate'                              => 'karate.html',
        'yoga-classes-in-ilford-redbridge-epping' => 'yoga.html',
        'tai-chi-chuan-in-ilford-redbridge-epping' => 'tai-chi.html',
        'shiatsu-in-ilford-epping'            => 'shiatsu.html',
        'ilford-coaching'                     => 'coaching.html',
        'aboutus'                             => 'about.html',
        'instructors'                         => 'instructors.html',
        'mentors'                             => 'instructors.html',
        'yudansha-wall'                       => 'yudansha.html',
        'testimonials'                        => 'testimonials.html',
        'fees'                                => 'fees.html',
        'contact'                             => 'contact.html',
        'register-for-classes'                => 'join.html',
        'blog'                                => 'blog/',
    );
    $posts = array('5-actionable-tips-to-becoming-a-better-karateka', 'bodhidharma-founder-of-martial-arts', 'budo-culture',
        'chi', 'clinic', 'coping-with-stress-is-karate-the-answer', 'coronavirus-online-karate-training',
        'creating-online-dojo-with-microsoft-teams', 'emptyhands-charity-cup', 'evidence-based-karate-training', 'fight-club',
        'history-of-karate-do', 'immunity-tips', 'karate-mindsets', 'karate_rules', 'kobudo', 'neurobics-for-karate',
        'reflections-learning-from-lockdown', 'shotokan-tigers', 'sotai-master-class-with-rex-lassalle', 'sports-injuries',
        'virtual-dojo', 'warm-up', 'workshop-with-shihan-chris-rowen', 'yoga-karate');

    $slug = preg_replace('/-\d+$/', '', $path);   // e.g. chi-2 -> chi
    if (isset($pages[$path]))          $to = $pages[$path];
    elseif (in_array($path, $posts))   $to = 'blog/' . $path . '.html';
    elseif (in_array($slug, $posts))   $to = 'blog/' . $slug . '.html';
    else                               $to = '';   // anything else -> home page

    wp_redirect($new . $to, 302);   // 302 = temporary, easy to undo
    exit;
});
