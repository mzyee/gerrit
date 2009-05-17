// Copyright (C) 2009 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.gwtexpui.globalkey.client;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.KeyPressEvent;
import com.google.gwt.event.dom.client.KeyPressHandler;
import com.google.gwt.user.client.DOM;
import com.google.gwt.user.client.ui.Anchor;
import com.google.gwt.user.client.ui.FlowPanel;
import com.google.gwt.user.client.ui.FocusPanel;
import com.google.gwt.user.client.ui.Grid;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HTMLTable.CellFormatter;
import com.google.gwtexpui.safehtml.client.SafeHtml;
import com.google.gwtexpui.safehtml.client.SafeHtmlBuilder;
import com.google.gwtexpui.user.client.PluginSafePopupPanel;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;


public class KeyHelpPopup extends PluginSafePopupPanel implements
    KeyPressHandler {
  private static final String S = "gwtexpui-globalkey-KeyboardShortcuts";

  private final FocusPanel focus;

  public KeyHelpPopup() {
    super(true/* autohide */, true/* modal */);
    setStyleName(S);

    final Anchor closer = new Anchor(Util.C.closeButton());
    closer.addClickHandler(new ClickHandler() {
      @Override
      public void onClick(final ClickEvent event) {
        hide();
      }
    });

    final Grid header = new Grid(1, 3);
    header.setStyleName(S + "-Header");
    header.setText(0, 0, Util.C.keyboardShortcuts());
    header.setWidget(0, 2, closer);

    final CellFormatter fmt = header.getCellFormatter();
    fmt.addStyleName(0, 1, S + "-HeaderGlue");
    fmt.setHorizontalAlignment(0, 2, HasHorizontalAlignment.ALIGN_RIGHT);

    final Grid lists = new Grid(0, 7);
    lists.setStyleName(S + "-Table");
    populate(lists);
    lists.getCellFormatter().addStyleName(0, 3, S + "-TableGlue");

    final FlowPanel body = new FlowPanel();
    body.add(header);
    DOM.appendChild(body.getElement(), DOM.createElement("hr"));
    body.add(lists);

    focus = new FocusPanel(body);
    DOM.setStyleAttribute(focus.getElement(), "outline", "0px");
    DOM.setElementAttribute(focus.getElement(), "hideFocus", "true");
    focus.addKeyPressHandler(this);
    add(focus);
  }

  @Override
  public void setVisible(final boolean show) {
    super.setVisible(show);
    if (show) {
      focus.setFocus(true);
    }
  }

  @Override
  public void onKeyPress(final KeyPressEvent event) {
    hide();
  }

  private void populate(final Grid lists) {
    final Iterator<KeyCommandSet> setitr =
        GlobalKey.active.all.getSets().iterator();
    int end[] = new int[5];
    int column = 0;
    while (setitr.hasNext()) {
      final KeyCommandSet set = setitr.next();
      int row = end[column];
      row = populate(lists, row, column, set);
      end[column] = row;
      if (column == 0) {
        column = 4;
      } else {
        column = 0;
      }
    }
  }

  private int populate(final Grid lists, int row, final int col,
      final KeyCommandSet set) {
    final List<KeyCommand> keys = new ArrayList<KeyCommand>(set.getKeys());
    Collections.sort(keys, new Comparator<KeyCommand>() {
      @Override
      public int compare(KeyCommand arg0, KeyCommand arg1) {
        if (arg0.keyMask < arg1.keyMask) {
          return -1;
        } else if (arg0.keyMask > arg1.keyMask) {
          return 1;
        }
        return 0;
      }
    });
    if (keys.isEmpty()) {
      return row;
    }

    if (lists.getRowCount() < row + 1 + keys.size()) {
      lists.resizeRows(row + 1 + keys.size());
    }

    final CellFormatter fmt = lists.getCellFormatter();
    lists.setText(row, col + 2, set.getName());
    fmt.addStyleName(row, col + 2, S + "-GroupTitle");
    row++;

    final int initialRow = row;
    FORMAT_KEYS: for (int i = 0; i < keys.size(); i++) {
      final KeyCommand k = keys.get(i);

      for (int prior = 0, r = initialRow; prior < i; prior++) {
        if (KeyCommand.same(keys.get(prior), k)) {
          final SafeHtmlBuilder b = new SafeHtmlBuilder();
          b.append(SafeHtml.get(lists, r, col + 0));
          b.append(" ");
          b.append(Util.C.orOtherKey());
          b.append(" ");
          b.append(k.describeKeyStroke());
          SafeHtml.set(lists, r, col + 0, b);
          continue FORMAT_KEYS;
        }
      }

      SafeHtml.set(lists, row, col + 0, k.describeKeyStroke());
      lists.setText(row, col + 1, ":");
      lists.setText(row, col + 2, k.getHelpText());

      fmt.addStyleName(row, col + 0, S + "-TableKeyStroke");
      fmt.addStyleName(row, col + 1, S + "-TableSeparator");
      row++;
    }

    return row;
  }
}
