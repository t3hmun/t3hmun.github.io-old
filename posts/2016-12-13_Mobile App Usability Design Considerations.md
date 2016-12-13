I don't enjoy the design of most mobile apps.
UIs seems to be designed based on aesthetics and not usability.
Reaching around the screen is often very uncomfortable and cumbersome.

There are two parts to usability: affordance and comfort.

The considerations in this article are entirely from my point of view; 
I'd do some actual research if I was designing for other people.

## Reach

The most annoying feature I encounter everyday is interactive elements that I can't reach.
The phone is held and operated by one hand and I cannot reach the entire screen comfortably.

Assuming one hand usage with thumb interacting with the screen:

```
 Screen reach comfort:                                                              
 Right hand grip               Both hands overlayed                                 
 +-------------------------+   +-------------------------+                          
 |                         |   |                         |                          
 |                         |   |                         |                          
 |                         |   |        TERRIBLE         |                          
 |      TERRIBLE        ---|   |                         |                          
 |                -----/   |   |                         |                          
 |          -----/         |   |          -- --          |                          
 |       --/               |   |       --/     \--       |                          
 |     -/                  |   |     -/           \-     |                          
 |  --/                    |   |  --/               \--  |                          
 |-/                       |   |-/                     \-|                          
 |                         |   |                         |                          
 |         GOOD            |   |          GOOD           |                          
 |                         |   |                         |                          
 |                         |   |                         |                          
 |                      ---|   |---                   ---|                          
 |                  ---/   |   |   \---           ---/   |                          
 |                  |      |   |      |           |      |                          
 |                 /  BAD  |   | BAD   \         /  BAD  |                          
 |                 |       |   |       |         |       |                          
 +-------------------------+   +-------------------------+ 
```

From the diagram the good comfort reach zone is rather small.
Anything that is interacted with very often must be in the good comfort area.

The bottom corners of the screen are difficult but not impossible to reach.
The top is and absolute pain to reach, requires shuffling the entire phone across the hand,
a manoeuvre that sometimes results in dropping the phone on my face. Terrible.

My rules:

* Most interactive content should be in the good zone.
* Only the most rarely interacted-with items can be allowed in the terrible zone.
* Only occasionally interacted items should be in the bad zone.


## Visibility

My thumb tends to hover over the bottom half of the screen, making is slightly less visible.
Therefore the best zone for viewing is the top half, especially content that is quickly scanned and dismissed.
The thumb like to hover in anticipation with quick content so its best to avoid the bottom for that.
For most other content however this is rather minor.


## Relevance in Menu Design

### Hamburger Menu

The most common menu design on android is the hamburger menu.
The hamburger menu positioned at the top of the screen in the terrible comfort zone.

### Edge Swiped Menu

These days it is common to summon the hamburger and other menus via an edge swiping gesture.
I do not find this satisfactory.

Swiping actions rarely have any affordance, there is nothing on the screen to indicate it as a possibility.
A tiny handle on the edge of the screen linked to the menu button might work, but tends to look ugly.
Swiping also has a tendency to fail when on the other side of the screen;
the phone gets squashed into the hand and the touch gets confused.
The bigger the screen the worse it gets, to the point where you can no longer reach the edge to swipe.
To add to this the gesture often gets confused with swiping the screen content, the Google Maps app is a prime example.

### Floating Action Button

The second android approach is the floating action button, a round button in the bottom corner of the screen.
That is position in my bad comfort zone, but this kind of menu should't be used that often so it is OK.
However I do have a problem with them, I rarely notice them.
I'm not sure if it is just my my mind filtering things, or the lower visibility of bottom corners.
I find the floating action button design to be a mess, I rarely have any idea of what it is going to do.

### Tab Bar

Apple's bottom of the screen [tab bar](https://developer.apple.com/ios/human-interface-guidelines/ui-bars/tab-bars/)
appears to be the most comfortable menu for me.

* It is rather obvious, covering the whole bottom edge of the screen.
* It is easy enough to interact occasionally.
* It provides immediate access to the menu, it is not a hidden menu.

The obvious big difference is that it is a small direct menu, not a large hidden menu as discussed before.
However this is probably a good thing, forces the design to stay simple and high level.
