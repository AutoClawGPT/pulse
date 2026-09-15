use {
    anchor_lang::{
        prelude::Pubkey,
        solana_program::{instruction::Instruction, system_program},
        AccountDeserialize, InstructionData, ToAccountMetas,
    },
    litesvm::LiteSVM,
    solana_keypair::Keypair,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_transaction::versioned::VersionedTransaction,
};

fn send(svm: &mut LiteSVM, payer: &Keypair, ix: Instruction) {
    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[payer]).unwrap();
    svm.send_transaction(tx).unwrap();
}

#[test]
fn vault_deposit_withdraw() {
    let program_id = pulse::id();
    let payer = Keypair::new();
    let vault = Pubkey::find_program_address(&[pulse::constants::VAULT_SEED], &program_id).0;
    let portfolio = Pubkey::find_program_address(
        &[pulse::constants::PORTFOLIO_SEED, payer.pubkey().as_ref()],
        &program_id,
    )
    .0;

    let mut svm = LiteSVM::new();
    let bytes = include_bytes!(concat!(
        env!("CARGO_TARGET_TMPDIR"),
        "/../deploy/pulse.so"
    ));
    svm.add_program(program_id, bytes).unwrap();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();

    send(
        &mut svm,
        &payer,
        Instruction::new_with_bytes(
            program_id,
            &pulse::instruction::InitializeVault {}.data(),
            pulse::accounts::InitializeVault {
                payer: payer.pubkey(),
                authority: payer.pubkey(),
                vault,
                system_program: system_program::ID,
            }
            .to_account_metas(None),
        ),
    );

    send(
        &mut svm,
        &payer,
        Instruction::new_with_bytes(
            program_id,
            &pulse::instruction::Deposit {
                amount: 1_000_000_000,
            }
            .data(),
            pulse::accounts::Deposit {
                owner: payer.pubkey(),
                vault,
                portfolio,
                system_program: system_program::ID,
            }
            .to_account_metas(None),
        ),
    );

    let mut data: &[u8] = &svm.get_account(&portfolio).unwrap().data;
    let p = pulse::state::Portfolio::try_deserialize(&mut data).unwrap();
    assert_eq!(p.collateral, 1_000_000_000);
    assert_eq!(p.owner, payer.pubkey());
}
