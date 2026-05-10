use starknet::ContractAddress;

#[derive(Drop, Serde)]
pub struct Player {
    pub username: ByteArray,
    pub best_taps: u32,
    pub rounds_played: u32,
    pub last_played_at: u64,
}

#[derive(Drop, Serde)]
pub struct LeaderboardEntry {
    pub player: ContractAddress,
    pub username: ByteArray,
    pub best_taps: u32,
}

#[starknet::interface]
pub trait ITap2Mine<TContractState> {
    fn register_username(ref self: TContractState, username: ByteArray);
    fn submit_round(ref self: TContractState, taps: u32);
    fn get_player(self: @TContractState, player: ContractAddress) -> Player;
    fn get_leaderboard(self: @TContractState) -> Array<LeaderboardEntry>;
}

#[starknet::contract]
pub mod Tap2Mine {
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};
    use super::{ITap2Mine, LeaderboardEntry, Player};

    const MAX_USERNAME_LEN: usize = 24;
    const MAX_LEADERBOARD_LEN: u32 = 10;

    #[storage]
    struct Storage {
        usernames: Map<ContractAddress, ByteArray>,
        has_username: Map<ContractAddress, bool>,
        best_taps: Map<ContractAddress, u32>,
        rounds_played: Map<ContractAddress, u32>,
        last_played_at: Map<ContractAddress, u64>,
        leaderboard: Map<u32, ContractAddress>,
        leaderboard_len: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        UsernameRegistered: UsernameRegistered,
        RoundSubmitted: RoundSubmitted,
    }

    #[derive(Drop, starknet::Event)]
    struct UsernameRegistered {
        #[key]
        pub player: ContractAddress,
        pub username: ByteArray,
    }

    #[derive(Drop, starknet::Event)]
    struct RoundSubmitted {
        #[key]
        pub player: ContractAddress,
        pub taps: u32,
        pub best_taps: u32,
        pub rounds_played: u32,
    }

    #[abi(embed_v0)]
    impl Tap2MineImpl of ITap2Mine<ContractState> {
        fn register_username(ref self: ContractState, username: ByteArray) {
            let caller = get_caller_address();
            let len = username.len();
            assert!(len > 0, "empty username");
            assert!(len <= MAX_USERNAME_LEN, "username too long");

            let event_username = username.clone();
            self.usernames.write(caller, username);
            self.has_username.write(caller, true);

            self.emit(UsernameRegistered { player: caller, username: event_username });
        }

        fn submit_round(ref self: ContractState, taps: u32) {
            let caller = get_caller_address();
            assert!(self.has_username.read(caller), "username required");
            assert!(taps > 0, "taps required");

            let rounds = self.rounds_played.read(caller) + 1;
            let previous_best = self.best_taps.read(caller);
            let mut best = previous_best;
            if taps > previous_best {
                best = taps;
                self.best_taps.write(caller, best);
                self.update_leaderboard(caller, best);
            }

            self.rounds_played.write(caller, rounds);
            self.last_played_at.write(caller, get_block_timestamp());

            self.emit(RoundSubmitted { player: caller, taps, best_taps: best, rounds_played: rounds });
        }

        fn get_player(self: @ContractState, player: ContractAddress) -> Player {
            Player {
                username: self.usernames.read(player),
                best_taps: self.best_taps.read(player),
                rounds_played: self.rounds_played.read(player),
                last_played_at: self.last_played_at.read(player),
            }
        }

        fn get_leaderboard(self: @ContractState) -> Array<LeaderboardEntry> {
            let mut rows = array![];
            let len = self.leaderboard_len.read();
            let mut i: u32 = 0;
            while i < len {
                let player = self.leaderboard.read(i);
                rows.append(
                    LeaderboardEntry {
                        player,
                        username: self.usernames.read(player),
                        best_taps: self.best_taps.read(player),
                    },
                );
                i += 1;
            };
            rows
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn update_leaderboard(ref self: ContractState, player: ContractAddress, taps: u32) {
            let mut len = self.leaderboard_len.read();
            let mut existing_index: u32 = MAX_LEADERBOARD_LEN;
            let mut i: u32 = 0;

            while i < len {
                if self.leaderboard.read(i) == player {
                    existing_index = i;
                    break;
                }
                i += 1;
            };

            if existing_index < MAX_LEADERBOARD_LEN {
                let mut shift = existing_index;
                while shift + 1 < len {
                    let next_player = self.leaderboard.read(shift + 1);
                    self.leaderboard.write(shift, next_player);
                    shift += 1;
                };
                len -= 1;
            }

            let mut insert_at = len;
            let mut scan: u32 = 0;
            while scan < len {
                let other = self.leaderboard.read(scan);
                if taps > self.best_taps.read(other) {
                    insert_at = scan;
                    break;
                }
                scan += 1;
            };

            if insert_at >= MAX_LEADERBOARD_LEN {
                self.leaderboard_len.write(len);
                return;
            }

            let new_len = if len < MAX_LEADERBOARD_LEN {
                len + 1
            } else {
                MAX_LEADERBOARD_LEN
            };

            let mut dst = new_len - 1;
            while dst > insert_at {
                let prev_player = self.leaderboard.read(dst - 1);
                self.leaderboard.write(dst, prev_player);
                dst -= 1;
            };

            self.leaderboard.write(insert_at, player);
            self.leaderboard_len.write(new_len);
        }
    }
}
