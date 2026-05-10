use starknet::{ContractAddress, contract_address_const};
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address,
    stop_cheat_caller_address,
};
use tap2mine::tap2mine::{ITap2MineDispatcher, ITap2MineDispatcherTrait};

fn alice() -> ContractAddress {
    contract_address_const::<'alice'>()
}

fn bob() -> ContractAddress {
    contract_address_const::<'bob'>()
}

fn user(n: felt252) -> ContractAddress {
    n.try_into().unwrap()
}

fn deploy_contract() -> ContractAddress {
    let contract = declare("Tap2Mine").unwrap().contract_class();
    let constructor_calldata = array![];
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

fn register(dispatcher: ITap2MineDispatcher, contract_address: ContractAddress, player: ContractAddress, name: ByteArray) {
    start_cheat_caller_address(contract_address, player);
    dispatcher.register_username(name);
    stop_cheat_caller_address(contract_address);
}

fn submit(dispatcher: ITap2MineDispatcher, contract_address: ContractAddress, player: ContractAddress, taps: u32) {
    start_cheat_caller_address(contract_address, player);
    dispatcher.submit_round(taps);
    stop_cheat_caller_address(contract_address);
}

#[test]
fn register_username_stores_player_name() {
    let contract_address = deploy_contract();
    let dispatcher = ITap2MineDispatcher { contract_address };

    register(dispatcher, contract_address, alice(), "alice");

    let player = dispatcher.get_player(alice());
    assert!(player.username == "alice", "wrong username");
    assert!(player.best_taps == 0, "best should start zero");
}

#[test]
#[should_panic(expected: "empty username")]
fn rejects_empty_username() {
    let contract_address = deploy_contract();
    let dispatcher = ITap2MineDispatcher { contract_address };

    start_cheat_caller_address(contract_address, alice());
    dispatcher.register_username("");
    stop_cheat_caller_address(contract_address);
}

#[test]
fn submit_first_round_sets_best_score() {
    let contract_address = deploy_contract();
    let dispatcher = ITap2MineDispatcher { contract_address };

    register(dispatcher, contract_address, alice(), "alice");
    submit(dispatcher, contract_address, alice(), 42);

    let player = dispatcher.get_player(alice());
    assert!(player.best_taps == 42, "wrong best");
    assert!(player.rounds_played == 1, "wrong rounds");

    let leaderboard = dispatcher.get_leaderboard();
    assert!(leaderboard.len() == 1, "wrong leaderboard len");
    let top = leaderboard.at(0);
    assert!(*top.player == alice(), "wrong leader");
    assert!(*top.best_taps == 42, "wrong leader taps");
}

#[test]
fn lower_score_does_not_replace_best_score() {
    let contract_address = deploy_contract();
    let dispatcher = ITap2MineDispatcher { contract_address };

    register(dispatcher, contract_address, alice(), "alice");
    submit(dispatcher, contract_address, alice(), 80);
    submit(dispatcher, contract_address, alice(), 30);

    let player = dispatcher.get_player(alice());
    assert!(player.best_taps == 80, "best should remain");
    assert!(player.rounds_played == 2, "round count should increase");
}

#[test]
fn higher_score_updates_best_and_leaderboard_order() {
    let contract_address = deploy_contract();
    let dispatcher = ITap2MineDispatcher { contract_address };

    register(dispatcher, contract_address, alice(), "alice");
    register(dispatcher, contract_address, bob(), "bob");
    submit(dispatcher, contract_address, alice(), 60);
    submit(dispatcher, contract_address, bob(), 70);
    submit(dispatcher, contract_address, alice(), 90);

    let leaderboard = dispatcher.get_leaderboard();
    let first = leaderboard.at(0);
    let second = leaderboard.at(1);
    assert!(*first.player == alice(), "alice should lead");
    assert!(*first.best_taps == 90, "wrong alice best");
    assert!(*second.player == bob(), "bob should be second");
}

#[test]
fn leaderboard_keeps_top_ten_ordered() {
    let contract_address = deploy_contract();
    let dispatcher = ITap2MineDispatcher { contract_address };

    let mut i: u32 = 1;
    while i <= 12 {
        let player = user(i.into());
        register(dispatcher, contract_address, player, "player");
        submit(dispatcher, contract_address, player, i * 10);
        i += 1;
    };

    let leaderboard = dispatcher.get_leaderboard();
    assert!(leaderboard.len() == 10, "top ten only");
    let first = leaderboard.at(0);
    let last = leaderboard.at(9);
    assert!(*first.best_taps == 120, "highest first");
    assert!(*last.best_taps == 30, "lowest retained");
}
