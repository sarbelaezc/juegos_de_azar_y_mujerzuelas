import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Charadas } from './features/charadas/charadas';
import { CHARADES_WORDS } from './features/charadas/charades-words';
import { Home } from './features/home/home';
import { Impostor } from './features/impostor/impostor';
import IMPOSTOR_WORDS from './features/impostor/impostor-words.json';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the home page and game cards', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Elige un juego');
    expect(compiled.querySelectorAll('[data-testid="game-card"]')).toHaveLength(2);
    expect(compiled.querySelector('[href="/charadas"]')).toBeTruthy();
    expect(compiled.querySelector('[href="/impostor"]')).toBeTruthy();
  });
});

describe('Game pages', () => {
  it('should render the Charadas page', async () => {
    await TestBed.configureTestingModule({
      imports: [Charadas],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Charadas);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Charadas');
    expect(compiled.querySelector('a[routerLink="/"]')).toBeTruthy();
  });

  it('should render the Impostor page', async () => {
    await TestBed.configureTestingModule({
      imports: [Impostor],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Impostor);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Impostor');
    expect(compiled.querySelector('a[routerLink="/"]')).toBeTruthy();
  });
});

describe('Charadas game', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Charadas>>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Charadas],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Charadas);
    await fixture.whenStable();
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should provide a word bank for every difficulty', () => {
    expect(CHARADES_WORDS.facil.length).toBeGreaterThan(0);
    expect(CHARADES_WORDS.intermedio.length).toBeGreaterThan(0);
    expect(CHARADES_WORDS.dificil.length).toBeGreaterThan(0);
  });

  it('should reveal the word only while the card is held', async () => {
    const startButton = Array.from(compiled.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Empezar a jugar'));
    startButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Siguiente palabra');
    expect(compiled.querySelector('[data-testid="charades-word"]')).toBeNull();

    const card = compiled.querySelector<HTMLButtonElement>('[data-testid="charades-card"]');
    card?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Siguiente palabra');
    expect(compiled.querySelector('[data-testid="charades-word"]')).toBeTruthy();
    expect(compiled.querySelector('[data-testid="charades-card"]')?.classList.contains('is-flipped'))
      .toBe(true);

    card?.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, button: 0 }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('[data-testid="charades-word"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="charades-card"]')?.classList.contains('is-flipped'))
      .toBe(false);
  });

  it('should update the selected difficulty and word bank size', async () => {
    const intermediateButton = Array.from(compiled.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Intermedio'));
    intermediateButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(intermediateButton?.getAttribute('aria-pressed')).toBe('true');
    expect(compiled.textContent).toContain(`${CHARADES_WORDS.intermedio.length} palabras`);
    expect(compiled.textContent).toContain('Personajes, acciones y situaciones conocidas.');
  });

  it('should not repeat a word before the selected bank is exhausted', async () => {
    const startButton = Array.from(compiled.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Empezar a jugar'));
    startButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const words = new Set<string>();
    const wordCount = CHARADES_WORDS.facil.length;

    for (let index = 0; index < wordCount; index += 1) {
      const card = compiled.querySelector<HTMLButtonElement>('[data-testid="charades-card"]');
      card?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
      await fixture.whenStable();
      fixture.detectChanges();

      const word = compiled.querySelector('[data-testid="charades-word"]')?.textContent?.trim();
      expect(word).toBeTruthy();
      words.add(word ?? '');

      card?.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, button: 0 }));
      await fixture.whenStable();
      fixture.detectChanges();

      const nextButton = Array.from(compiled.querySelectorAll('button'))
        .find((button) => button.textContent?.includes('Siguiente palabra'));
      nextButton?.click();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    expect(words).toHaveLength(wordCount);
    expect(compiled.textContent).toContain('¡Banco completado!');
  });
});

describe('Impostor game', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<Impostor>>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Impostor],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Impostor);
    await fixture.whenStable();
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  async function clickButton(text: string): Promise<void> {
    const button = Array.from(compiled.querySelectorAll('button'))
      .find(
        (candidate) =>
          candidate.textContent?.includes(text) || candidate.getAttribute('aria-label') === text,
      );
    expect(button).toBeTruthy();
    button?.click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function holdRoleCard(): Promise<void> {
    const card = compiled.querySelector<HTMLButtonElement>('[data-testid="impostor-card"]');
    expect(card).toBeTruthy();
    card?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function releaseRoleCard(): Promise<void> {
    const card = compiled.querySelector<HTMLButtonElement>('[data-testid="impostor-card"]');
    card?.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, button: 0 }));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function enterNames(names: string[]): Promise<void> {
    let playerCount = Number(compiled.querySelector('output')?.textContent?.trim());
    while (playerCount > names.length) {
      const decreaseButton = compiled.querySelector<HTMLButtonElement>(
        'button[aria-label="Quitar un jugador"]',
      );
      decreaseButton?.click();
      await fixture.whenStable();
      fixture.detectChanges();
      playerCount -= 1;
    }
    while (playerCount < names.length) {
      const increaseButton = compiled.querySelector<HTMLButtonElement>(
        'button[aria-label="Agregar un jugador"]',
      );
      increaseButton?.click();
      await fixture.whenStable();
      fixture.detectChanges();
      playerCount += 1;
    }
    await clickButton('Continuar');
    const inputs = compiled.querySelectorAll<HTMLInputElement>('input[id^="player-name-"]');
    names.forEach((name, index) => {
      inputs[index].value = name;
      inputs[index].dispatchEvent(new Event('input'));
    });
    await fixture.whenStable();
    fixture.detectChanges();
    await clickButton('Revisar participantes');
  }

  async function addVotes(name: string, count: number): Promise<void> {
    for (let index = 0; index < count; index += 1) {
      await clickButton(`Agregar un voto a ${name}`);
    }
  }

  it('should ask for player count before names', async () => {
    expect(compiled.textContent).toContain('¿Cuántos van a jugar?');
    expect(compiled.textContent).toContain('Con 4 jugadores habrá 1 impostor.');
    expect(compiled.querySelector('input[id^="player-name-"]')).toBeNull();
    await clickButton('Continuar');
    expect(compiled.querySelectorAll('input[id^="player-name-"]')).toHaveLength(4);
  });

  it('should announce two impostors when the group has seven players', async () => {
    for (let count = 4; count < 7; count += 1) {
      await clickButton('Agregar un jugador');
    }

    expect(compiled.textContent).toContain('Con 7 jugadores habrá 2 impostores.');
    expect(compiled.textContent).toContain('De 3 a 6 jugadores: 1 · De 7 a 12 jugadores: 2');
  });

  it('should assign two impostors to a group of seven players', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      await enterNames(['Ana', 'Beto', 'Cami', 'Diego', 'Eva', 'Fran', 'Gus']);
      await clickButton('Repartir roles');

      let impostorCount = 0;
      for (let index = 0; index < 7; index += 1) {
        await holdRoleCard();
        if (compiled.textContent?.includes('Eres el impostor')) {
          impostorCount += 1;
          expect(compiled.querySelector('[data-testid="impostor-hint"]')?.textContent?.trim())
            .toBeTruthy();
        } else {
          expect(compiled.querySelector('[data-testid="secret-word"]')?.textContent?.trim())
            .toBeTruthy();
        }

        await clickButton(index === 6 ? 'Terminar reparto' : 'Siguiente participante');
      }

      expect(impostorCount).toBe(2);
      await clickButton('Iniciar votación');
      await addVotes('Ana', 4);
      await addVotes('Beto', 3);
      expect(compiled.textContent).toContain('7 / 7');
      expect(compiled.querySelector<HTMLButtonElement>('button[aria-label="Agregar un voto a Ana"]')?.disabled)
        .toBe(true);
      await clickButton('Ver resultado');
      await clickButton('Revelar solución');
      expect(compiled.textContent).toContain('Los impostores eran');
      expect(compiled.querySelectorAll('li .rounded-full')).toHaveLength(2);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('should provide a unique secret word bank', () => {
    const categories = Object.entries(IMPOSTOR_WORDS);
    const entries = categories.flatMap(([category, words]) =>
      words.map((entry) => ({ ...entry, category })),
    );

    expect(categories.length).toBeGreaterThanOrEqual(10);
    expect(entries.length).toBeGreaterThan(60);
    expect(entries.every((entry) =>
      entry.word.trim() &&
      entry.hints.length >= 2 &&
      entry.hints.every((hint) => hint.trim()) &&
      entry.category.trim(),
    ))
      .toBe(true);
    expect(new Set(entries.map((entry) => entry.word)).size).toBe(entries.length);
  });

  it('should require a name for every player before continuing', async () => {
    await clickButton('Continuar');
    await clickButton('Revisar participantes');

    expect(compiled.textContent).toContain('Escribe el nombre de cada participante');
    expect(compiled.querySelector('ol')).toBeNull();
  });

  it('should let players be edited, reordered, and removed', async () => {
    await enterNames(['Ana', 'Beto', 'Cami', 'Diego']);

    const moveBetoUp = compiled.querySelector<HTMLButtonElement>(
      'button[aria-label="Mover a Beto hacia arriba"]',
    );
    moveBetoUp?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(compiled.querySelector('ol')?.textContent?.indexOf('Beto'))
      .toBeLessThan(compiled.querySelector('ol')?.textContent?.indexOf('Ana') ?? -1);

    compiled.querySelector<HTMLButtonElement>('button[aria-label="Editar a Beto"]')?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const editInput = compiled.querySelector<HTMLInputElement>('input[id^="edit-player-"]');
    expect(editInput).toBeTruthy();
    if (editInput) {
      editInput.value = 'Bea';
      editInput.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
    fixture.detectChanges();
    await clickButton('Guardar');
    expect(compiled.textContent).toContain('Bea');

    compiled.querySelector<HTMLButtonElement>('button[aria-label="Eliminar a Diego"]')?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(compiled.textContent).not.toContain('Diego');
    expect(compiled.querySelectorAll('ol li')).toHaveLength(3);
  });

  it('should show the active player and allow reordering during role review', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      await enterNames(['Ana', 'Beto', 'Cami', 'Diego']);
      await clickButton('Repartir roles');

      const activeParticipant = compiled.querySelector<HTMLElement>(
        'section[aria-labelledby="reveal-order-title"] [aria-current="step"]',
      );
      expect(activeParticipant?.textContent).toContain('Revisando');
      const currentName = compiled.querySelector('[data-testid="current-player-name"]')?.textContent;
      expect(activeParticipant?.textContent).toContain(currentName);

      compiled.querySelector<HTMLButtonElement>('button[aria-label="Mover a Beto hacia arriba"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(compiled.textContent).toContain(currentName);
      expect(compiled.querySelector('[aria-current="step"]')?.textContent).toContain('Revisando');
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('should restart role assignment when a participant is removed mid-round', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      await enterNames(['Ana', 'Beto', 'Cami', 'Diego']);
      await clickButton('Repartir roles');
      await holdRoleCard();
      expect(compiled.querySelector('[data-testid="secret-word"]')).toBeTruthy();

      compiled.querySelector<HTMLButtonElement>('button[aria-label="Eliminar a Diego"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(compiled.textContent)
        .toContain('Se eliminó un participante. Reparte los roles de nuevo para continuar.');
      expect(compiled.textContent).toContain('Orden de participantes');
      expect(compiled.querySelector('[data-testid="secret-word"]')).toBeNull();
      expect(compiled.querySelectorAll('ol[aria-label="Participantes en orden de turno"] li')).toHaveLength(3);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('should privately deal a word or impostor role and reveal the answer after everyone', async () => {
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.999999)
      .mockReturnValueOnce(0.999999)
      .mockReturnValue(0);

    try {
      await enterNames(['Ana', 'Beto', 'Cami']);
      await clickButton('Repartir roles');
      await holdRoleCard();

      expect(compiled.textContent).toContain('Eres el impostor');
      expect(compiled.querySelector('[data-testid="impostor-card"]')?.classList.contains('is-flipped'))
        .toBe(true);
      expect(compiled.querySelector('[data-testid="impostor-category"]')?.textContent?.trim())
        .toBe('Lugares');
      expect(compiled.querySelector('[data-testid="impostor-hint"]')?.textContent?.trim())
        .toBe('Aquí se espera antes de viajar.');
      expect(compiled.querySelector('[data-testid="secret-word"]')).toBeNull();
      await releaseRoleCard();
      expect(compiled.querySelector('[data-testid="impostor-category"]')).toBeNull();
      expect(compiled.querySelector('[data-testid="impostor-hint"]')).toBeNull();
      await clickButton('Siguiente participante');
      expect(compiled.querySelector('[data-testid="impostor-card"]')?.classList.contains('is-flipped'))
        .toBe(false);
      await holdRoleCard();
      expect(compiled.querySelector('[data-testid="secret-word"]')?.textContent?.trim())
        .toBe('Aeropuerto');
      await clickButton('Siguiente participante');
      await holdRoleCard();
      expect(compiled.querySelector('[data-testid="secret-word"]')?.textContent?.trim())
        .toBe('Aeropuerto');
      await clickButton('Terminar reparto');

      expect(compiled.textContent).toContain('¡A debatir!');
      expect(compiled.textContent).not.toContain('Aeropuerto');
      await clickButton('Iniciar votación');
      expect(compiled.querySelector('ol[aria-label="Votos por participante"]')).toBeTruthy();
      expect(compiled.querySelector<HTMLButtonElement>('button[aria-label="Quitar un voto a Beto"]')?.disabled)
        .toBe(true);
      expect(
        Array.from(compiled.querySelectorAll<HTMLButtonElement>('button'))
          .find((button) => button.textContent?.includes('Ver resultado'))?.disabled,
      ).toBe(true);
      await addVotes('Ana', 2);
      await addVotes('Beto', 1);
      expect(compiled.textContent).toContain('3 / 3');
      expect(compiled.querySelector<HTMLButtonElement>('button[aria-label="Agregar un voto a Cami"]')?.disabled)
        .toBe(true);
      await clickButton('Ver resultado');

      expect(compiled.textContent).toContain('¡Encontraron a todos!');
      expect(compiled.querySelector('li')?.textContent).toContain('Impostor');
      await clickButton('Revelar solución');
      expect(compiled.textContent).toContain('Aeropuerto');
    } finally {
      randomSpy.mockRestore();
    }
  });
});
