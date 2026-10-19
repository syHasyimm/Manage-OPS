<?php

return [

    // IP/CIDR proxy dipisahkan koma. Di luar Docker, default tidak mempercayai proxy.
    'proxies' => env('TRUSTED_PROXIES'),

];
