/*globals XSS*/

XSS.Client = function() {
    'use strict';

    var canvasPixels       = XSS.canvas.pixels,
        marginLeft         = 40,
        marginTop          = 63,
        currentMenu        = 'main',
        menuOptionSelected = {},

        menuOptions = {
            main: [
                ['mp', 'MULTIPLAYER', 'Play with a friend or (un)friendly stranger.'],
                ['sp', 'SINGLE PLAYER', 'Play with yourself, get some practise.'],
                ['help', 'HEEELP?!!', 'How do I use this computer electronic device?'],
                ['credits', 'CREDITS', 'Made by Blaise Kal, 2012.']
            ],
            back: [
                ['back', '← TAKE ME TO YOUR MAIN MENU']
            ],
            matchmaking: [
                ['quick', 'QUICK MATCH WITH A STRANGER', 'Quickly play a game using matchmaking.'],
                ['host', 'HOST A PRIVATE GAME', 'Generates a secret game URL to give to a friend.']
            ],
            gametype: [
                ['friendly', 'FRIENDLY MODE', 'May slightly dent your ego ♥'],
                ['xss', 'XSS MODE', ['The winner of the game is able to execute Java-',
                                    'script in the browser of the loser...  alert(’☠’)']]
            ]
        },

        menuActions = {
            mp      : {input: 'name'},
            help    : {page: 'help'},
            credits : {page: 'credits'},
            back    : {menu: 'main'},
            name    : {menu: 'matchmaking'},
            quick   : {menu: 'gametype'},
            host    : {menu: 'gametype'}
        },

        menuPages = {
            help: function() {
                return [].concat(
                    XSS.font.write(marginLeft, marginTop + -18,  'HEEELP?!'),
                    XSS.font.write(marginLeft, marginTop + 0,  '• Play using the arrow keys on your keyboard'),
                    XSS.font.write(marginLeft, marginTop + 9,  '• You can chat during the game by typing+enter'),
                    XSS.font.write(marginLeft, marginTop + 18, '• Open Source at github.com/blaisekal/xssnake'),
                    XSS.font.write(marginLeft, marginTop + 27, '• Github is also for bugs and feature requests'),
                    XSS.font.write(marginLeft, marginTop + 36, '• Other questions or issues: blaisekal@gmail.com'),
                    XSS.font.write(marginLeft, marginTop + 54, 'Press any key to go back')
                );
            },

            credits: function() {
                return [].concat(
                    XSS.font.write(marginLeft, marginTop + -18,  'CREDITS'),
                    XSS.font.write(marginLeft, marginTop + 0, 'Blaise Kal:'),
                    XSS.font.write(marginLeft, marginTop + 9, 'PLACEHOLDER:'),
                    XSS.font.write(marginLeft, marginTop + 18, 'PLACEHOLDER:'),
                    XSS.font.write(marginLeft, marginTop + 36, 'Press any key to go back'),
                    XSS.font.write(marginLeft + 52, marginTop + 0, 'Code, Pixels, Concept'),
                    XSS.font.write(marginLeft + 52, marginTop + 9, 'Testing, Hosting'),
                    XSS.font.write(marginLeft + 52, marginTop + 18, 'Testing, Snoek')
                );
            }
        },

        menuInputs = {
            name: function() {
                return XSS.font.write(marginLeft, marginTop, 'Ni Hao, my name is:');
            }
        },

        getMenu = function(menu) {
            var settings, options;

            options = menuOptions[menu];
            if (!options) {
                throw 'Menu does not exist: ' + menu;
            }

            menuOptionSelected[menu] = menuOptionSelected[menu] || 0;

            if (menuOptionSelected[menu] < 0) {
                menuOptionSelected[menu] = options.length - 1;
            } else if (menuOptionSelected[menu] > options.length - 1) {
                menuOptionSelected[menu] = 0;
            }

            settings = {
                selected: menuOptionSelected[menu],
                options: options
            };

            return XSS.drawables.getMenuPixels(menu, marginLeft, marginTop, settings);
        },

        getMenuInstructionPixels = function(instruction) {
            var welcome = XSS.font.write(0, 0, 'WELCOME  2  XSSNAKE');
            return [].concat(
                XSS.effects.zoomX2(welcome, marginLeft, 23),
                XSS.font.write(marginLeft, 36, (new Array(45)).join('+')),
                XSS.font.write(marginLeft, 45, instruction)
            );
        },

        showMenuScreen = function(menu) {
            canvasPixels.structure    = {pixels: XSS.drawables.getOuterBorderPixels()};
            canvasPixels.menuInstruct = {pixels: getMenuInstructionPixels('Use arrow keys to navigate and Enter to select.')};
            canvasPixels.menu         = {pixels: getMenu(menu)};
        },

        switchMenus = function(menu) {
            var newMenuOptions,
                menuPixels = getMenu(menu);

            newMenuOptions = {start: XSS.settings.width, end: 0, callback: function() {
                currentMenu = menu;
                canvasPixels.menu = {pixels: menuPixels};
            }};

            XSS.effects.swipe('oldmenu', getMenu(currentMenu));
            XSS.effects.swipe('newMenu', menuPixels, newMenuOptions);

            currentMenu = false;
            delete canvasPixels.menu;
        },

        menuToPage = function(page) {
            var backToMenu = currentMenu;
            canvasPixels.menu = {pixels: (menuPages[page])()};
            canvasPixels.menuInstruct = {pixels: getMenuInstructionPixels('')};
            currentMenu = false;
            $(document).one('keydown', function() {
                currentMenu = backToMenu;
                showMenuScreen(backToMenu);
            });
        },

        menuToInput = function(inputName) {
            var inputPixels, inputCaretPos, onInput,
                repaintEvents   = 'keydown.' + inputName + ' keyup.' + inputName,
                labelPixels     = (menuInputs[inputName])(),
                labelBBox       = XSS.drawables.getBoundingBox(labelPixels),
                inputTextLeft   = labelBBox.x2 + 4,

                inputSubmit = function() {
                    delete canvasPixels.menu;
                    delete canvasPixels.input;

                    XSS.input.focus().off(repaintEvents);
                    XSS.effects.stopPulse('caret');
                    XSS.effects.swipe('input', labelPixels.concat(inputPixels));

                    var menu = menuActions[inputName].menu;
                    var menuPixels = getMenu(menu);
                    var newMenuOptions = {start: XSS.settings.width, end: 0, callback: function() {
                        currentMenu = menu;
                        showMenuScreen(menu);
                    }};

                    XSS.effects.swipe('newMenu', menuPixels, newMenuOptions);

                },

                inputUpdate = function() {
                    var input = XSS.input[0],
                        inputTextValue = input.value;

                    inputPixels      = XSS.font.write(inputTextLeft, labelBBox.y, inputTextValue);
                    inputCaretPos    = XSS.font.getLength(inputTextValue.substr(0, input.selectionStart));
                    canvasPixels.input = {pixels: inputPixels};

                    // Disallow selections because it is too annoying to visually represent it
                    if (input.selectionStart !== input.selectionEnd) {
                        input.selectionStart = input.selectionEnd;
                    }

                    inputCaretPos = inputCaretPos || -1;

                    XSS.effects.pulse('caret', XSS.drawables.line(
                        inputCaretPos + inputTextLeft, labelBBox.y - 1,
                        inputCaretPos + inputTextLeft, labelBBox.y2));
                },

                paintForm = function () {

                    canvasPixels.menu = {
                        pixels: labelPixels
                    };
                    canvasPixels.menuInstruct = {
                        pixels: getMenuInstructionPixels('Start typing and press Enter when you’re done.')
                    };

                    onInput = function (e) {
                        if (e.which === 13) {
                            inputSubmit();
                        } else {
                            inputUpdate();
                        }
                    };

                    XSS.input.focus();
                    XSS.input.on(repaintEvents, onInput);

                    inputUpdate();
                };

            XSS.effects.swipe('oldmenu', getMenu(currentMenu));
            XSS.effects.swipe('input', labelPixels, {start: XSS.settings.width, end: 0, callback: paintForm});

            currentMenu = false;
            delete canvasPixels.menu;
        };

    $(document).on('/xss/client/menu/chosen', function(e, option) {
        var action = menuActions[option];

        if (action) {
            if (action.menu) {
                switchMenus(action.menu);
            } else if (action.page) {
                menuToPage(action.page);
            } else if (action.input) {
                menuToInput(action.input);
            }
        }

        $(document).trigger('/xss/client/menu/chosen/' + option);
    });

    $(document).on('/xss/client/key/up.menu', function() {
        if (currentMenu) {
            menuOptionSelected[currentMenu]--;
            canvasPixels.menu = {pixels: getMenu(currentMenu)};
        }
    });

    $(document).on('/xss/client/key/down.menu', function() {
        if (currentMenu) {
            menuOptionSelected[currentMenu]++;
            canvasPixels.menu = {pixels: getMenu(currentMenu)};
        }
    });

    $(document).on('/xss/client/key/enter.menu', function() {
        var option;
        if (currentMenu) {
            option = menuOptions[currentMenu][menuOptionSelected[currentMenu]][0];
            $(document).trigger('/xss/client/menu/chosen', [option]);
        }
    });

    $(document).on('keydown', function(e) {
        switch (e.which) {
            case 13: // Enter
                $(document).trigger('/xss/client/key/enter'); break;
            case 8:  // Backspace
            case 27: // Escape
                $(document).trigger('/xss/client/key/cancel'); break;
            case 37: // Left
                $(document).trigger('/xss/client/key/left'); break;
            case 38: // Up
                $(document).trigger('/xss/client/key/up'); break;
            case 39: // Right
                $(document).trigger('/xss/client/key/right');break;
            case 40: // Bottom
                $(document).trigger('/xss/client/key/down'); break;
        }
    });

    XSS.input.on('click', function() {
        if (currentMenu) {
            canvasPixels.mousemove = {pixels: XSS.font.write(15, XSS.settings.height - 12, 'POINTING DEVICES ARE NOT SUPPORTED - USE KEYBOARD')};
            window.clearTimeout(XSS.mouseTimer);
            XSS.mouseTimer = window.setTimeout(function() {
                delete canvasPixels.mousemove;
            }, 1500);
        }
    });


    // TODO: bind to websocket connect
    showMenuScreen(currentMenu);



//
//    $(document).on('/xss/canvas/paint', pulsatingPixels);

    // Load start template
    // $(document).on('/xss/client/start', showMainMenu);

//
//    // Server requests a name
//    $(document).on('/xss/client/request_name', function(e, data) {
//        var name = getDefaultName();
//        XSS.send('name', name);
//    });
//
//    // Server requests a mode (xss or not)
//    $(document).on('/xss/client/request_mode', function(e, data) {
//        var mode = 'xss';
//        XSS.send('mode', mode);
//    });
//
//    // Server notifies client
//    $(document).on('/xss/client/notice', function(e, data) {
//        addtoChat(data);
//    });

//    $(document).on('/xss/client/playerlist', function(e, data) {
//        setPlayerList(data);
//    });

//    $(document).on('/xss/client/chat', function(e, data) {
//        addtoChat(data.text, data.name);
//    });

//    // Client has paired with other client and is loading game
//    // game.js will notify server when useris ready to play
//    $(document).on('/xss/client/paired', function(e, data) {
//        loadHTML(data.load, function() {
//            $('.opponent').text(data.opponent.name);
//        });
//    });

//    // Opponent has disconnected
//    $(document).on('/xss/client/opponent_disconnected', function(e, data) {
//        loadHTML(data.load, function() {
//            XSS.send('disconnect_ok');
//        });
//    });

//    // Chat form submit
//    $(document).on('submit', 'form', function(e) {
//        var lobby, form;
//
//        form      = lobby.find('form').on('submit', handleChatFormSubmit);
//        nameField = form.find('[name=name]');
//        textField = form.find('[name=text]');
//    });


};