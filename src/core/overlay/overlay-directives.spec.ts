import {
    inject,
    async,
    fakeAsync,
    flushMicrotasks,
    addProviders,
    TestComponentBuilder,
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {ConnectedOverlayDirective, OverlayModule} from './overlay-directives';
import {OverlayContainer} from './overlay-container';
import {ConnectionPositionPair} from './position/connected-position';
import {ConnectedPositionStrategy} from './position/connected-position-strategy';


describe('Overlay directives', () => {
  let builder: TestComponentBuilder;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ConnectedOverlayDirectiveTest>;
  let fixtureWithPositions: ComponentFixture<ConnectedOverlayDirectiveWithPositionsTest>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      declarations: [ConnectedOverlayDirectiveTest],
    });

    addProviders([
      {provide: OverlayContainer, useFactory: () => {
        overlayContainerElement = document.createElement('div');
        return {getContainerElement: () => overlayContainerElement};
      }}
    ]);
  }));

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  beforeEach(async(() => {
    builder.createAsync(ConnectedOverlayDirectiveTest).then(f => {
      fixture = f;
      fixture.detectChanges();
    });
  }));

  it(`should create an overlay and attach the directive's template`, () => {
    expect(overlayContainerElement.textContent).toContain('Menu content');
  });

  it('should destroy the overlay when the directive is destroyed', fakeAsync(() => {
    fixture.destroy();
    flushMicrotasks();

    expect(overlayContainerElement.textContent.trim()).toBe('');
  }));

  it('should use a connected position strategy with a default set of positions', () => {
    let testComponent: ConnectedOverlayDirectiveTest =
        fixture.debugElement.componentInstance;
    let overlayDirective = testComponent.connectedOverlayDirective;

    let strategy =
        <ConnectedPositionStrategy> overlayDirective.overlayRef.getState().positionStrategy;
    expect(strategy) .toEqual(jasmine.any(ConnectedPositionStrategy));

    let positions = strategy.positions;
    expect(positions.length).toBeGreaterThan(0);
  });

  describe('with given position', () => {
    beforeEach(async(() => {
      builder.createAsync(ConnectedOverlayDirectiveWithPositionsTest).then(f => {
        fixtureWithPositions = f;
        fixtureWithPositions.detectChanges();
      });
    }));

    it('should use a connected position strategy with a given set of positions', () => {
      let testComponent: ConnectedOverlayDirectiveWithPositionsTest =
          fixtureWithPositions.debugElement.componentInstance;
      let overlayDirective = testComponent.connectedOverlayDirective;

      let strategy =
          <ConnectedPositionStrategy> overlayDirective.overlayRef.getState().positionStrategy;

      let positions = strategy.positions;
      expect(testComponent.positions).toBe(overlayDirective.positions);
    });
  })
});


@Component({
  template: `
  <button overlay-origin #trigger="overlayOrigin">Toggle menu</button>
  <template connected-overlay [origin]="trigger">
    <p>Menu content</p>
  </template>`,
})
class ConnectedOverlayDirectiveTest {
  @ViewChild(ConnectedOverlayDirective) connectedOverlayDirective: ConnectedOverlayDirective;
}


@Component({
  template: `
  <button overlay-origin #trigger="overlayOrigin">Toggle menu</button>
  <template connected-overlay [origin]="trigger" [positions]="positions">
    <p>Menu content</p>
  </template>`,
})
class ConnectedOverlayDirectiveWithPositionsTest {
  @ViewChild(ConnectedOverlayDirective) connectedOverlayDirective: ConnectedOverlayDirective;
  positions: ConnectionPositionPair[] = [
    new ConnectionPositionPair(
      {originX: 'start', originY: 'bottom'},
      {overlayX: 'end', overlayY: 'bottom'})
  ];
}
