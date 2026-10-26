import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SiteHeader } from '../../shared/site-header/site-header';
import WORDS from './impostor-words.json';

interface Player {
  id: number;
  name: string;
}

interface SecretWord {
  word: string;
  category: string;
  hint: string;
}

interface WordEntry {
  word: string;
  hints: readonly string[];
}

type GameStage = 'count' | 'names' | 'players' | 'reveal' | 'discussion' | 'voting' | 'results';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;
const TWO_IMPOSTOR_THRESHOLD = 7;
const WORD_BANK = Object.entries(WORDS).flatMap(([category, entries]) =>
  (entries as WordEntry[]).map((entry) => ({ ...entry, category })),
);

@Component({
  selector: 'app-impostor',
  imports: [SiteHeader],
  templateUrl: './impostor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Impostor {
  protected readonly minPlayers = MIN_PLAYERS;
  protected readonly maxPlayers = MAX_PLAYERS;
  protected readonly impostorCount = computed(() => this.getImpostorCount(this.playerCount()));
  protected readonly stage = signal<GameStage>('count');
  protected readonly playerCount = signal(4);
  protected readonly nameDrafts = signal<string[]>([]);
  protected readonly players = signal<Player[]>([]);
  protected readonly editingPlayerId = signal<number | null>(null);
  protected readonly editingName = signal('');
  protected readonly errorMessage = signal('');
  protected readonly roundNotice = signal('');
  protected readonly currentPlayerIndex = signal(0);
  protected readonly votes = signal<Record<number, number>>({});
  protected readonly cardRevealed = signal(false);
  protected readonly answerRevealed = signal(false);
  protected readonly secretWord = signal<SecretWord | null>(null);
  protected readonly impostorIds = signal<number[]>([]);
  protected readonly currentPlayer = computed(
    () => this.players()[this.currentPlayerIndex()] ?? null,
  );
  protected readonly impostorName = computed(
    () =>
      this.players()
        .filter((player) => this.impostorIds().includes(player.id))
        .map((player) => player.name)
        .join(', '),
  );
  protected readonly nameSlots = computed(() => this.nameDrafts().map((_, index) => index));
  protected readonly voteProgress = computed(() =>
    Object.values(this.votes()).reduce((total, count) => total + count, 0),
  );
  protected readonly voteTally = computed(() => {
    return this.players().map((player) => ({
      ...player,
      votes: this.votes()[player.id] ?? 0,
    }));
  });
  protected readonly voteLeaders = computed(() => {
    const tally = this.voteTally();
    const highestVoteCount = Math.max(0, ...tally.map((entry) => entry.votes));
    return tally.filter((entry) => entry.votes === highestVoteCount);
  });
  protected readonly votingOutcome = computed(() => {
    const leaders = this.voteLeaders();
    const allImpostorsFound = this.impostorIds().every((id) =>
      leaders.some((leader) => leader.id === id),
    );
    const onlyImpostorsLead = leaders.every((leader) => this.impostorIds().includes(leader.id));

    if (allImpostorsFound && onlyImpostorsLead) {
      return 'found';
    }
    if (leaders.some((leader) => this.impostorIds().includes(leader.id)) &&
      leaders.some((leader) => !this.impostorIds().includes(leader.id))) {
      return 'tie';
    }
    return 'escaped';
  });

  private nextPlayerId = 1;

  protected decreasePlayerCount(): void {
    this.playerCount.update((count) => Math.max(MIN_PLAYERS, count - 1));
  }

  protected increasePlayerCount(): void {
    this.playerCount.update((count) => Math.min(MAX_PLAYERS, count + 1));
  }

  protected beginNameEntry(): void {
    this.nameDrafts.set(Array.from({ length: this.playerCount() }, () => ''));
    this.errorMessage.set('');
    this.stage.set('names');
  }

  protected updateNameDraft(index: number, event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.nameDrafts.update((names) =>
      names.map((name, nameIndex) => (nameIndex === index ? target.value : name)),
    );
    this.errorMessage.set('');
  }

  protected isNameDraftInvalid(index: number): boolean {
    if (!this.errorMessage()) {
      return false;
    }

    const names = this.nameDrafts();
    const name = this.normalizeName(names[index] ?? '');
    return !name || names.filter((candidate) => this.normalizeName(candidate) === name).length > 1;
  }

  protected saveNames(): void {
    const names = this.nameDrafts().map((name) => name.trim());
    if (names.some((name) => name.length === 0)) {
      this.errorMessage.set('Escribe el nombre de cada participante para continuar.');
      return;
    }
    if (this.hasDuplicateNames(names)) {
      this.errorMessage.set('Cada participante debe tener un nombre diferente.');
      return;
    }

    this.players.set(names.map((name) => ({ id: this.nextPlayerId++, name })));
    this.playerCount.set(names.length);
    this.errorMessage.set('');
    this.stage.set('players');
  }

  protected updateEditingName(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.editingName.set(target.value);
      this.errorMessage.set('');
    }
  }

  protected startEditing(player: Player): void {
    this.editingPlayerId.set(player.id);
    this.editingName.set(player.name);
    this.errorMessage.set('');
  }

  protected saveEditing(): void {
    const playerId = this.editingPlayerId();
    const name = this.editingName().trim();
    if (playerId === null || name.length === 0) {
      this.errorMessage.set('El nombre no puede quedar vacío.');
      return;
    }
    if (this.players().some((player) =>
      player.id !== playerId && this.normalizeName(player.name) === this.normalizeName(name),
    )) {
      this.errorMessage.set('Ya existe un participante con ese nombre.');
      return;
    }

    this.players.update((players) =>
      players.map((player) => (player.id === playerId ? { ...player, name } : player)),
    );
    this.editingPlayerId.set(null);
    this.errorMessage.set('');
  }

  protected cancelEditing(): void {
    this.editingPlayerId.set(null);
    this.errorMessage.set('');
  }

  protected movePlayer(index: number, offset: -1 | 1): void {
    const destination = index + offset;
    const players = [...this.players()];
    if (destination < 0 || destination >= players.length) {
      return;
    }

    const activePlayerId = this.currentPlayer()?.id;
    [players[index], players[destination]] = [players[destination], players[index]];
    this.players.set(players);
    if (activePlayerId !== undefined) {
      this.currentPlayerIndex.set(players.findIndex((player) => player.id === activePlayerId));
    }
  }

  protected removePlayer(playerId: number): void {
    if (this.players().length <= MIN_PLAYERS) {
      this.errorMessage.set(`La partida necesita al menos ${MIN_PLAYERS} participantes.`);
      return;
    }

    this.players.update((players) => players.filter((player) => player.id !== playerId));
    this.playerCount.set(this.players().length);
    if (this.stage() === 'reveal' || this.stage() === 'voting' || this.stage() === 'results') {
      this.stage.set('players');
      this.impostorIds.set([]);
      this.secretWord.set(null);
      this.votes.set({});
      this.answerRevealed.set(false);
      this.cardRevealed.set(false);
      this.roundNotice.set('Se eliminó un participante. Reparte los roles de nuevo para continuar.');
    }
    if (this.editingPlayerId() === playerId) {
      this.cancelEditing();
    }
    this.errorMessage.set('');
  }

  protected addPlayer(): void {
    if (this.players().length >= MAX_PLAYERS) {
      this.errorMessage.set(`La partida admite hasta ${MAX_PLAYERS} participantes.`);
      return;
    }

    const player: Player = {
      id: this.nextPlayerId++,
      name: `Jugador ${this.players().length + 1}`,
    };
    this.players.update((players) => [...players, player]);
    this.playerCount.set(this.players().length);
    this.startEditing(player);
  }

  protected startRound(): void {
    const players = this.players();
    if (players.length < MIN_PLAYERS || players.some((player) => player.name.trim().length === 0)) {
      this.errorMessage.set(`Necesitas al menos ${MIN_PLAYERS} participantes con nombre.`);
      return;
    }

    const shuffledPlayers = [...players];
    for (let index = shuffledPlayers.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledPlayers[index], shuffledPlayers[swapIndex]] = [
        shuffledPlayers[swapIndex],
        shuffledPlayers[index],
      ];
    }
    const wordIndex = Math.floor(Math.random() * WORD_BANK.length);
    const selectedWord = WORD_BANK[wordIndex];
    const hintIndex = Math.floor(Math.random() * selectedWord.hints.length);
    const impostorIds = shuffledPlayers
      .slice(0, this.getImpostorCount(players.length))
      .map((player) => player.id);
    this.impostorIds.set(impostorIds);
    this.secretWord.set({
      word: selectedWord.word,
      category: selectedWord.category,
      hint: selectedWord.hints[hintIndex],
    });
    this.currentPlayerIndex.set(0);
    this.cardRevealed.set(false);
    this.answerRevealed.set(false);
    this.votes.set({});
    this.errorMessage.set('');
    this.roundNotice.set('');
    this.stage.set('reveal');
  }

  protected revealCard(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    this.capturePointer(event);
    this.cardRevealed.set(true);
  }

  protected revealCardWithKeyboard(event: KeyboardEvent): void {
    if (event.key !== ' ' && event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    this.cardRevealed.set(true);
  }

  protected hideCard(): void {
    this.cardRevealed.set(false);
  }

  protected hideCardWithKeyboard(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      this.hideCard();
    }
  }

  protected passToNextPlayer(): void {
    this.cardRevealed.set(false);
    const nextIndex = this.currentPlayerIndex() + 1;
    if (nextIndex >= this.players().length) {
      this.stage.set('discussion');
      return;
    }

    this.currentPlayerIndex.set(nextIndex);
  }

  protected revealAnswer(): void {
    this.answerRevealed.set(true);
  }

  protected startVoting(): void {
    this.votes.set(Object.fromEntries(this.players().map((player) => [player.id, 0])));
    this.answerRevealed.set(false);
    this.stage.set('voting');
  }

  protected changeVotes(playerId: number, amount: -1 | 1): void {
    if (!this.players().some((player) => player.id === playerId)) {
      return;
    }

    const currentVotes = this.votes();
    const playerVotes = currentVotes[playerId] ?? 0;
    const nextPlayerVotes = playerVotes + amount;
    if (nextPlayerVotes < 0 || this.voteProgress() + amount > this.players().length) {
      return;
    }

    this.votes.set({ ...currentVotes, [playerId]: nextPlayerVotes });
  }

  protected votesFor(playerId: number): number {
    return this.votes()[playerId] ?? 0;
  }

  protected finishVoting(): void {
    if (this.voteProgress() === 0 || this.voteProgress() > this.players().length) {
      return;
    }
    this.stage.set('results');
  }

  protected isVoteTotalValid(): boolean {
    return this.voteProgress() > 0 && this.voteProgress() <= this.players().length;
  }

  protected returnToPlayers(): void {
    this.stage.set('players');
    this.editingPlayerId.set(null);
    this.cardRevealed.set(false);
    this.answerRevealed.set(false);
    this.errorMessage.set('');
    this.roundNotice.set('');
  }

  protected isImpostor(player: Player): boolean {
    return this.impostorIds().includes(player.id);
  }

  private getImpostorCount(playerCount: number): number {
    return playerCount >= TWO_IMPOSTOR_THRESHOLD ? 2 : 1;
  }

  private hasDuplicateNames(names: readonly string[]): boolean {
    const normalizedNames = names.map((name) => this.normalizeName(name));
    return new Set(normalizedNames).size !== normalizedNames.length;
  }

  private normalizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ').normalize('NFC').toLocaleLowerCase('es');
  }

  private capturePointer(event: PointerEvent): void {
    const target = event.currentTarget;
    if (
      typeof event.pointerId === 'number' &&
      target instanceof HTMLElement &&
      typeof target.setPointerCapture === 'function'
    ) {
      target.setPointerCapture(event.pointerId);
    }
  }
}
