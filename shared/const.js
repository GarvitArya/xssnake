xss.WIDTH = 256;
xss.HEIGHT = 161;

xss.GAME_TILE = 4;

// Netcode events
xss.NC_CHAT_NOTICE = 10;
xss.NC_CHAT_MESSAGE = 11;

xss.NC_GAME_DESPAWN = 20;
xss.NC_GAME_STATE = 21;
xss.NC_GAME_SPAWN = 22;

xss.NC_PING = 0;
xss.NC_PONG = 1;

xss.NC_PLAYER_NAME = 30;
xss.NC_PLAYERS_SERIALIZE = 31;

xss.NC_ROOM_JOIN_KEY = 40;
xss.NC_ROOM_JOIN_MATCHING = 41;
xss.NC_ROOM_SERIALIZE = 42;
xss.NC_ROOM_START = 43;
xss.NC_ROOM_STATUS = 44;
xss.NC_ROOM_JOIN_ERROR = 45;

xss.NC_OPTIONS_SERIALIZE = 47;

xss.NC_ROUND_SERIALIZE = 50;
xss.NC_ROUND_COUNTDOWN = 51;
xss.NC_ROUND_START = 52;
xss.NC_ROUND_WRAPUP = 53;

xss.NC_SCORE_UPDATE = 60;

xss.NC_SNAKE_ACTION = 70;
xss.NC_SNAKE_CRASH = 71;
xss.NC_SNAKE_SIZE = 72;
xss.NC_SNAKE_SPEED = 73;
xss.NC_SNAKE_UPDATE = 74;

xss.NC_XSS = 666;


// Server EventEmitters
xss.SE_PLAYER_DISCONNECT = 101;
xss.SE_PLAYER_COLLISION = 102;

xss.HEARTBEAT_INTERVAL_MS = 5000;

xss.GAME_SHIFT_MAP = [[-1, 0], [0, -1], [1, 0], [0, 1]];

xss.DIRECTION_LEFT = 0;
xss.DIRECTION_UP = 1;
xss.DIRECTION_RIGHT = 2;
xss.DIRECTION_DOWN = 3;

xss.ROOM_KEY_LENGTH = 5;
xss.ROOM_CAPACITY = 6;
xss.ROUNDS_MAX = 3;
xss.ROOM_WIN_BY_MIN = 2;

xss.PLAYER_NAME_MINLENGTH = 1;
xss.PLAYER_NAME_MAXWIDTH = 36;

xss.SECONDS_ROUND_PAUSE = 3;
xss.SECONDS_ROUND_GLOAT = 5;
xss.SECONDS_ROUNDSET_GLOAT = 10;
xss.SECONDS_ROUND_COUNTDOWN = 3;

xss.SPAWN_SOMETHING_EVERY = [20, 60];
xss.SPAWN_CHANCE_APPLE = 0.9;

xss.SNAKE_SPEED = 120;
xss.SNAKE_SIZE = 4;

xss.FIELD_VALUE_EASY = 1;
xss.FIELD_VALUE_MEDIUM = 2;
xss.FIELD_VALUE_HARD = 3;

xss.ROOM_JOINABLE = 1;
xss.ROOM_INVALID_KEY = 2;
xss.ROOM_FULL = 3;
xss.ROOM_NOT_FOUND = 4;
xss.ROOM_IN_PROGRESS = 5;
xss.ROOM_UNKNOWN_ERROR = 6;

xss.CRASH_UNKNOWN = 0;
xss.CRASH_WALL = 1;
xss.CRASH_MOVING_WALL = 2;
xss.CRASH_SELF = 3;
xss.CRASH_OPPONENT = 4;
xss.CRASH_OPPONENT_DRAW = 5;

xss.NETCODE_PING_INTERVAL = 3000;
xss.NETCODE_SYNC_MS = 500;

xss.VALIDATE_SUCCES = 0;
xss.VALIDATE_ERR_GAP = 1;
xss.VALIDATE_ERR_NO_COMMON = 2;
xss.VALIDATE_ERR_MISMATCHES = 3;

xss.SCORE_LEADING = 1;
xss.SCORE_NEUTRAL = 2;
xss.SCORE_BEHIND = 3;

xss.SPAWN_APPLE = 1;
xss.SPAWN_POWERUP = 2;

xss.NOTICE_CRASH = 1;
xss.NOTICE_JOIN = 2;
xss.NOTICE_DISCONNECT = 3;
xss.NOTICE_NEW_ROUND = 4;
